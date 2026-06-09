let activeTabId: number | null = null;
let isRecording = false;
let isSetupMode = false;

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

  // 1. Enter Setup Phase
  chrome.tabs.sendMessage(activeTabId, { action: 'ENTER_SETUP' }).catch(err => {
    console.error("FixTheFlow: Content script not found.", err);
    isSetupMode = false;
  });
}

function stopCapture() {
  if (!isRecording) return;
  chrome.runtime.sendMessage({ action: 'STOP_RECORDING_OFFSCREEN' });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Setup Bar requested to start recording
  if (message.action === 'FINISH_SETUP') {
    isSetupMode = false;
    isRecording = true;
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'START_RECORDING_PHASE' });
    }
  }

  // Content script finished preparing for recording
  if (message.action === 'MASKS_APPLIED' && sender.tab?.id === activeTabId) {
    chrome.tabCapture.getMediaStreamId({ targetTabId: activeTabId }, async (streamId: string) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to get stream ID:", chrome.runtime.lastError);
        isRecording = false;
        return;
      }
      if (streamId) {
        await setupOffscreenDocument('src/offscreen.html');
        chrome.runtime.sendMessage({
          action: 'START_RECORDING_OFFSCREEN',
          streamId
        });
      }
    });
  }

  // Stop requested from Toolbar
  if (message.action === 'STOP_CAPTURE') {
    stopCapture();
  }

  // Recording finished from offscreen
  if (message.action === 'RECORDING_FINISHED') {
    isRecording = false;
    chrome.offscreen.closeDocument().catch(err => console.error("Error closing offscreen:", err));
    
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'SHOW_OVERLAY',
        videoBase64: message.videoBase64,
        maskedCount: message.maskedCount
      }).catch(err => {
        console.error("Error sending overlay to content script:", err);
      });
      activeTabId = null;
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


