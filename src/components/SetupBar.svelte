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
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .setup-bar {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 100px;
    padding: 8px 10px 8px 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
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
  }

  .status-badge {
    display: flex;
    align-items: center;
    background: #1A1A1A;
    padding: 4px 10px;
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-badge span {
    color: #A1A1AA;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .pulse-dot {
    display: none; /* Removed the glowing dot entirely */
  }

  .instructions {
    color: #E4E4E7;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.2px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .close-btn {
    background: transparent;
    color: #71717A;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
  }

  .start-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(180deg, #FF453A 0%, #FF3B30 100%);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
    padding: 10px 20px;
    border-radius: 100px;
    box-shadow: 0 4px 16px rgba(255, 59, 48, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .start-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background: linear-gradient(180deg, #FF5147 0%, #FF453A 100%);
  }
  
  .start-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
  }

  @keyframes slideDown {
    from { transform: translate(-50%, -24px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
</style>
