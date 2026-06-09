let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_RECORDING_OFFSCREEN') {
    startRecording(message.streamId).catch(err => {
      console.error("Offscreen capture failed", err);
    });
  }
  
  if (message.action === 'STOP_RECORDING_OFFSCREEN') {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }
});

async function startRecording(streamId: string) {
  recordedChunks = [];
  
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    } as any
  });

  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach(track => track.stop());
    
    // Generate Video Blob
    const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    
    // Convert Blob to Base64 data URL to send over message passing
    const reader = new FileReader();
    reader.readAsDataURL(videoBlob);
    reader.onloadend = () => {
      const base64data = reader.result;
      chrome.runtime.sendMessage({
        action: 'RECORDING_FINISHED',
        videoBase64: base64data
      });
    };
  };

  mediaRecorder.start();
}
