let activeTabId: number | null = null;
let isRecording = false;
let isSetupMode = false;
let popupWindowId: number | null = null;

// Clear any stale permission flags from previous versions
chrome.storage.local.remove(['hasMediaPermissions', 'hasMicPermission', 'hasCameraPermission']);

async function setupOffscreenDocument(path: string) {
  // Check if it already exists
  if (await chrome.offscreen.hasDocument()) {
    return;
  }

  // Create document
  await chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: 'Recording the active tab for UI issue capture'
  });
}

function startCapture(tab: chrome.tabs.Tab) {
  if (isRecording) {
    stopCapture();
    return;
  }
  
  if (isSetupMode) return;

  if (!tab.id) return;
  activeTabId = tab.id;

  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:') || tab.url.startsWith('https://chrome.google.com/webstore'))) {
    console.warn("FixTheFlow: Cannot capture restricted browser pages.");
    return;
  }

  isSetupMode = true;

  // 1. Enter Pre-Setup Phase
  chrome.tabs.sendMessage(activeTabId, { action: 'SHOW_PRE_SETUP_MODAL' }).catch(err => {
    console.error("FixTheFlow: Content script not found.", err);
    isSetupMode = false;
    
    // If the content script isn't found (e.g. extension was reloaded but page wasn't),
    // inject a simple fallback script to alert the user.
    chrome.scripting.executeScript({
      target: { tabId: activeTabId! },
      func: () => {
        alert("FixTheFlow was just updated! Please refresh this page to use it.");
      }
    }).catch(e => console.error("Could not inject fallback alert", e));
  });
}

function stopCapture() {
  chrome.runtime.sendMessage({ action: 'STOP_RECORDING_OFFSCREEN' });
  if (!isRecording && activeTabId) {
    chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
    activeTabId = null;
  }
}

let pendingSetupConfig: any = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Pre-Setup finished, moving to Setup
  if (message.action === 'ENTER_SETUP_PHASE') {
    const config = message.config || {};

    if (config.useMic) {
      // Always open the permissions popup when mic is needed.
      // Offscreen documents CANNOT trigger a mic prompt on their own —
      // the user MUST grant it from a visible extension page every time
      // Chrome's permission state is not "granted".
      pendingSetupConfig = config;
      chrome.windows.create({
        url: chrome.runtime.getURL(`src/permissions.html?mic=${config.useMic}`),
        type: 'popup',
        width: 420,
        height: 500,
        focused: true
      }, (window) => {
        popupWindowId = window?.id || null;
      });
    } else {
      // No mic needed, go straight to setup
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'ENTER_SETUP', config });
      }
    }
  }

  if (message.action === 'REQUEST_PERMISSIONS_POPUP') {
    const config = message.config || {};
    pendingSetupConfig = config;
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/permissions.html?mic=${config.useMic}`),
      type: 'popup',
      width: 400,
      height: 480,
      focused: true
    }, (window) => {
      popupWindowId = window?.id || null;
    });
  }

  if (message.action === 'PERMISSIONS_GRANTED_IN_POPUP') {
    if (activeTabId && pendingSetupConfig) {
      // Permission was granted in the popup — now enter setup
      chrome.tabs.sendMessage(activeTabId, { action: 'ENTER_SETUP', config: pendingSetupConfig });
      pendingSetupConfig = null;
    }
  }

  if (message.action === 'PERMISSIONS_DENIED_IN_POPUP') {
    if (activeTabId) {
      // Abort setup because permissions were denied
      chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
      activeTabId = null;
      isSetupMode = false;
    }
    pendingSetupConfig = null;
  }

  // Setup Bar requested to start recording
  if (message.action === 'FINISH_SETUP') {
    isSetupMode = false;
    isRecording = true;
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'START_RECORDING_PHASE', config: message.config });
    }
  }

  if (message.action === 'CANCEL_SETUP') {
    isSetupMode = false;
    isRecording = false;
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
      activeTabId = null;
    }
  }

  // Content script finished preparing for recording
  if (message.action === 'MASKS_APPLIED' && sender.tab?.id === activeTabId) {
    const config = message.config || {};
    setupOffscreenDocument('src/offscreen.html').then(() => {
      chrome.tabCapture.getMediaStreamId({ targetTabId: activeTabId! }, async (streamId: string) => {
        if (chrome.runtime.lastError) {
          console.error("Failed to get stream ID:", chrome.runtime.lastError);
          isRecording = false;
          if (activeTabId) chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
          return;
        }
        if (streamId) {
          chrome.runtime.sendMessage({
            action: 'START_RECORDING_OFFSCREEN',
            streamId,
            useMic: config.useMic,
            tabId: activeTabId
          });
        }
      });
    });
  }

  if (message.action === 'MIC_FAILED') {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'MIC_FAILED', error: message.error }).catch(() => {});
    }
  }

  if (message.action === 'RECORDING_FAILED') {
    isRecording = false;
    chrome.offscreen.closeDocument().catch(() => {});
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
      activeTabId = null;
    }
  }

  // Stop requested from Toolbar
  if (message.action === 'STOP_CAPTURE') {
    stopCapture();
  }

  // Recording finished from offscreen
  if (message.action === 'RECORDING_FINISHED') {
    isRecording = false;
    chrome.offscreen.closeDocument().catch(() => {});
    
    // Use tabId from message (survives SW suspension) or fallback to activeTabId
    const tabId = message.tabId || activeTabId;
    activeTabId = null;
    
    if (tabId) {
      const overlayPayload = {
        action: 'SHOW_OVERLAY',
        videoBase64: message.videoBase64,
        maskedCount: message.maskedCount
      };
      
      // Try sending to the existing content script first
      chrome.tabs.sendMessage(tabId, overlayPayload).catch(async () => {
        // Content script is gone (user navigated). Re-inject it, then retry.
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['src/content.ts']
          });
          // Give the content script a moment to initialize
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, overlayPayload).catch(err => {
              console.error("FixTheFlow: Could not deliver overlay even after re-injection.", err);
            });
          }, 500);
        } catch (injectErr) {
          console.error("FixTheFlow: Cannot inject content script into this tab.", injectErr);
        }
      });
    }
  }
});

chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === 'capture-friction') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) startCapture(tab);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab) startCapture(tab);
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
    // User closed the popup window without granting or denying
    if (isSetupMode && pendingSetupConfig) {
      isSetupMode = false;
      pendingSetupConfig = null;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'EXIT_SETUP' }).catch(() => {});
        activeTabId = null;
      }
    }
  }
});
