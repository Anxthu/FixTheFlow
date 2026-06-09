<script lang="ts">
  import { Download, Share, X, CheckCircle2 } from '@lucide/svelte';
  
  // Svelte 5 props
  let { videoBlob, maskedCount }: { videoBlob: Blob, maskedCount: number } = $props();

  let videoUrl = $derived(URL.createObjectURL(videoBlob));
  let isExiting = $state(false);

  function handleClose() {
    isExiting = true;
    setTimeout(() => {
      document.getElementById('fixtheflow-root')?.remove();
    }, 300);
  }

  function handleDownload() {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `FrictionReport_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    handleClose();
  }
</script>

<div class="overlay-container" class:exiting={isExiting}>
  <div class="card">
    <div class="header">
      <h2 class="title">Friction Report</h2>
      <button class="close-btn" onclick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>

    <div class="video-container">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={videoUrl} autoplay loop muted playsinline></video>
    </div>

    <div class="status-panel">
      <div class="status-badge">
        <CheckCircle2 size={16} />
        <span>{maskedCount} Input Elements Encrypted Client-Side</span>
      </div>
      <p class="status-desc">
        Your passwords and personal data were perfectly blurred before recording. This clip never leaves your device unless you share it.
      </p>
    </div>

    <div class="actions">
      <button class="btn btn-secondary" onclick={handleClose}>
        Discard (Esc)
      </button>
      <button class="btn btn-primary" onclick={handleDownload}>
        <Download size={16} />
        Download .webm
      </button>
    </div>
  </div>
</div>

<style>
  :global(#fixtheflow-root) {
    --sys-bg-base: #0A0A0C;
    --sys-surface-elevation-1: #121215;
    --sys-surface-elevation-2: #1C1C21;
    --sys-border-subtle: #2A2A32;
    --sys-text-primary: #F5F5F7;
    --sys-text-secondary: #8E8E93;
    --sys-brand-accent: #007AFF;
    --sys-brand-success: #34C759;
    --sys-font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .overlay-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto; /* Re-enable pointer events for the overlay */
    background: rgba(10, 10, 12, 0.4);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: var(--sys-font-main);
  }

  .overlay-container.exiting {
    animation: fadeOut 0.3s forwards;
  }

  .card {
    width: 380px;
    background-color: var(--sys-surface-elevation-1);
    border-radius: 20px;
    border: 1px solid var(--sys-border-subtle);
    padding: 16px;
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.3), 
      0 12px 24px -4px rgba(0, 0, 0, 0.5), 
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    color: var(--sys-text-primary);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--sys-text-secondary);
    cursor: pointer;
    border-radius: 50%;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: var(--sys-surface-elevation-2);
    color: var(--sys-text-primary);
  }

  .video-container {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    border: 1px solid var(--sys-border-subtle);
    margin-bottom: 16px;
    aspect-ratio: 16/9;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-panel {
    background: var(--sys-surface-elevation-2);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 24px;
    border: 1px solid var(--sys-border-subtle);
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--sys-brand-success);
    font-weight: 500;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .status-desc {
    font-size: 13px;
    color: var(--sys-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: transparent;
    color: var(--sys-text-primary);
    border: 1px solid var(--sys-border-subtle);
  }

  .btn-secondary:hover {
    background: var(--sys-surface-elevation-2);
  }

  .btn-primary {
    background: var(--sys-brand-accent);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
  }

  .btn-primary:hover {
    filter: brightness(1.1);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to { opacity: 0; transform: scale(0.95) translateY(10px); }
  }
</style>
