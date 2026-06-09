<script lang="ts">
  import { Mic, Camera, MousePointerClick, Check } from '@lucide/svelte';

  let useMic = false;
  let useClicks = false;

  function handleContinue() {
    window.dispatchEvent(new CustomEvent('FIXTHEFLOW_PRE_SETUP_DONE', {
      detail: { useMic, useClicks }
    }));
  }

  function toggleMic() { useMic = !useMic; }
  function toggleClicks() { useClicks = !useClicks; }
</script>

<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <img src={chrome.runtime.getURL('fixtheeflowsvg.svg')} alt="Logo" class="logo" />
      <h2>Ready to Record?</h2>
      <p>Configure your recording settings before setting up masks.</p>
    </div>

    <div class="options">
      <!-- Mic Option -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="option-row" class:active={useMic} onclick={toggleMic}>
        <div class="option-icon">
          <Mic size={20} />
        </div>
        <div class="option-text">
          <h3>Microphone</h3>
          <p>Speak while recording your flow</p>
        </div>
        <div class="toggle">
          {#if useMic}<Check size={14} strokeWidth={3} />{/if}
        </div>
      </div>



      <!-- Clicks Option -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="option-row" class:active={useClicks} onclick={toggleClicks}>
        <div class="option-icon">
          <MousePointerClick size={20} />
        </div>
        <div class="option-text">
          <h3>Highlight Clicks</h3>
          <p>Show visual ripples when clicking</p>
        </div>
        <div class="toggle">
          {#if useClicks}<Check size={14} strokeWidth={3} />{/if}
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="continue-btn" onclick={handleContinue}>Continue to Setup</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
    animation: fadeIn 0.3s ease;
  }

  .modal {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    width: 400px;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-header {
    padding: 32px 32px 24px 32px;
    text-align: center;
  }

  .logo {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }

  .modal-header h2 {
    margin: 0 0 8px 0;
    color: #1d1d1f;
    font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.374px;
  }

  .modal-header p {
    margin: 0;
    color: #7a7a7a;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: -0.224px;
  }

  .options {
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .option-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f5f5f7;
    border: 1px solid transparent;
    border-radius: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-row:hover {
    background: #e8e8ed;
  }

  .option-row.active {
    background: #ffffff;
    border-color: #0066cc;
    box-shadow: 0 0 0 1px #0066cc;
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    color: #7a7a7a;
    transition: all 0.2s;
  }

  .option-row.active .option-icon {
    background: #0066cc;
    color: #ffffff;
    border-color: #0066cc;
  }

  .option-text {
    flex: 1;
  }

  .option-text h3 {
    margin: 0 0 4px 0;
    color: #1d1d1f;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.374px;
  }

  .option-text p {
    margin: 0;
    color: #7a7a7a;
    font-size: 14px;
    letter-spacing: -0.224px;
  }

  .toggle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.2s;
  }

  .option-row.active .toggle {
    background: #0066cc;
    border-color: #0066cc;
    color: #ffffff;
  }

  .modal-footer {
    padding: 32px 24px 24px 24px;
  }

  .continue-btn {
    width: 100%;
    background: #0066cc;
    color: #ffffff;
    border: none;
    padding: 11px 22px;
    border-radius: 9999px;
    font-size: 17px;
    font-weight: 400;
    letter-spacing: -0.374px;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .continue-btn:hover {
    /* No color change on hover per guidelines */
  }

  .continue-btn:active {
    transform: scale(0.95);
  }

  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
