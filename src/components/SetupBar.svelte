<script lang="ts">
  import { Video } from '@lucide/svelte';

  function startRecording() {
    chrome.runtime.sendMessage({ action: 'FINISH_SETUP' });
  }
</script>

<div class="setup-bar-container">
  <div class="setup-bar">
    <div class="info">
      <span class="badge">SETUP MODE</span>
      <span>Click any element on the page to manually blur it.</span>
    </div>
    <button class="start-btn" onclick={startRecording}>
      <Video size={16} />
      Start Recording
    </button>
  </div>
</div>

<style>
  .setup-bar-container {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    pointer-events: none;
    animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .setup-bar {
    background-color: #121215;
    border: 1px solid #2A2A32;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
  }

  .info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #F5F5F7;
    font-size: 14px;
  }

  .badge {
    background-color: #007AFF;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .start-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FF3B30;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .start-btn:hover {
    background: #E0352A;
  }

  @keyframes slideDown {
    from { transform: translate(-50%, -20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
</style>
