<script lang="ts">
  import { Video, X } from '@lucide/svelte';

  function startRecording() {
    chrome.runtime.sendMessage({ action: 'FINISH_SETUP' });
  }

  function cancelSetup() {
    chrome.runtime.sendMessage({ action: 'CANCEL_SETUP' });
  }
</script>

<div class="setup-bar-container">
  <div class="setup-bar">
    <div class="info">
      <img src={chrome.runtime.getURL('fixtheeflowsvg.svg')} alt="FixTheFlow" class="app-logo" />
      <div class="status-badge">
        <div class="pulse-dot"></div>
        <span>SETUP</span>
      </div>
      <span class="instructions">Click any element to manually blur it.</span>
    </div>
    <div class="actions">
      <button class="start-btn" onclick={startRecording}>
        <Video size={16} strokeWidth={2.5} />
        <span>Start Recording</span>
      </button>
      <button class="close-btn" onclick={cancelSetup} title="Exit Setup">
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  </div>
</div>

<style>
  .setup-bar-container {
    position: fixed;
    top: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    pointer-events: none;
    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  }

  .setup-bar {
    background: rgba(245, 245, 247, 0.8);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid #e0e0e0;
    border-radius: 9999px;
    padding: 8px 10px 8px 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    pointer-events: auto;
  }

  .info {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .app-logo {
    width: 24px;
    height: 24px;
    /* Optional: Since it's a white theme now, if the SVG is white, we might need to invert or use a dark version. 
       Assuming SVG handles itself or has colors. */
  }

  .status-badge {
    display: flex;
    align-items: center;
    background: transparent;
    padding: 4px 10px;
    border-radius: 9999px;
    border: 1px solid #e0e0e0;
  }

  .status-badge span {
    color: #1d1d1f;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .pulse-dot {
    display: none;
  }

  .instructions {
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.224px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .close-btn {
    background: #f5f5f7;
    color: #1d1d1f;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.15s ease;
  }

  .close-btn:hover {
    background: #e8e8ed;
  }

  .start-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ff3b30;
    color: #ffffff;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.224px;
    padding: 11px 22px;
    border-radius: 9999px;
    transition: transform 0.15s ease;
  }

  .start-btn:hover {
    /* No color change on hover */
  }
  
  .start-btn:active {
    transform: scale(0.95);
  }

  @keyframes slideDown {
    from { transform: translate(-50%, -24px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
</style>
