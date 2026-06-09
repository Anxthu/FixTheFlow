// ============================================================
// FixTheFlow - Offscreen Document
// Handles: Screen recording and mic capture
// ============================================================

// --- Recording State ---
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let currentTabId: number | null = null;

// ============================================================
// Message Handler
// ============================================================
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  switch (message.action) {
    case 'START_RECORDING_OFFSCREEN':
      currentTabId = message.tabId;
      startRecording(message.streamId, message.useMic).catch(err => {
        console.error('FixTheFlow: Recording failed to start', err);
        chrome.runtime.sendMessage({ action: 'RECORDING_FAILED', error: err.toString() });
      });
      break;

    case 'STOP_RECORDING_OFFSCREEN':
      stopRecording();
      break;
  }
});

// ============================================================
// Screen Recording
// ============================================================
async function startRecording(streamId: string, useMic: boolean) {
  recordedChunks = [];
  let micStream: MediaStream | null = null;
  // 1. Capture mic audio FIRST (avoids Chrome constraint bugs when tab capture is active)
  if (useMic) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      console.error('FixTheFlow: Mic capture failed', err);
      // Notify the user exactly why the mic failed (e.g. no mic plugged in, or OS blocked it)
      chrome.runtime.sendMessage({ 
        action: 'MIC_FAILED', 
        error: err.name ? `${err.name}: ${err.message}` : err.toString()
      });
      // We don't crash here; we'll just record without mic
    }
  }

  // 2. Capture tab video
  const tabStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    } as any
  });

  // 3. Build final stream
  const finalTracks = [...tabStream.getVideoTracks()];
  if (micStream) {
    const micTrack = micStream.getAudioTracks()[0];
    if (micTrack) finalTracks.push(micTrack);
  }

  const finalStream = new MediaStream(finalTracks);

  // 4. Start MediaRecorder
  mediaRecorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    finalStream.getTracks().forEach(track => track.stop());

    const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(videoBlob);
    reader.onloadend = () => {
      try {
        chrome.runtime.sendMessage({
          action: 'RECORDING_FINISHED',
          videoBase64: reader.result,
          tabId: currentTabId
        });
      } catch (err) {
        console.error("Failed to send video blob to background, video might be too large (>50MB).", err);
        chrome.runtime.sendMessage({ action: 'RECORDING_FAILED', error: "Video file is too large to process." });
      }
    };
  };

  mediaRecorder.start();
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
