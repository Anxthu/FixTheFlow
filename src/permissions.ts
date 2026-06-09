/**
 * FixTheFlow - Permissions Page
 * 
 * This page exists because Chrome offscreen documents CANNOT trigger
 * a permission prompt on their own. The user must grant mic/camera
 * permission from a visible extension page (this popup). Once granted
 * here, the permission persists for the entire extension origin, so
 * the offscreen document can use getUserMedia without a prompt.
 */

async function requestPermissions() {
  const urlParams = new URLSearchParams(window.location.search);
  const useMic = urlParams.get('mic') === 'true';

  const constraints: MediaStreamConstraints = {};
  if (useMic) constraints.audio = true;

  // Nothing to request
  if (!constraints.audio) {
    chrome.runtime.sendMessage({ action: 'PERMISSIONS_DENIED_IN_POPUP' });
    window.close();
    return;
  }

  try {
    // This triggers Chrome's permission prompt (requires user gesture)
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Stop all tracks — we only needed to trigger the prompt
    stream.getTracks().forEach(track => track.stop());

    // Verify the permission actually stuck
    let micGranted = false;

    if (useMic) {
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      micGranted = micStatus.state === 'granted';
    }

    chrome.runtime.sendMessage({
      action: 'PERMISSIONS_GRANTED_IN_POPUP',
      grantedMic: micGranted
    });

    window.close();
  } catch (err) {
    console.error("FixTheFlow: Permission request failed:", err);
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Permission was denied. Please click the button to try again.';
      status.style.color = '#FF453A';
    }
    const btn = document.getElementById('grant-btn') as HTMLButtonElement;
    if (btn) {
      btn.innerText = 'Try Again';
      btn.disabled = false;
    }
  }
}

document.getElementById('grant-btn')?.addEventListener('click', () => {
  const btn = document.getElementById('grant-btn') as HTMLButtonElement;
  btn.innerText = "Waiting for permission...";
  btn.disabled = true;
  const status = document.getElementById('status');
  if (status) status.textContent = '';
  requestPermissions();
});
