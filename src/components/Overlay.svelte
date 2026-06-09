<script lang="ts">
  import { Download, Share, X, CheckCircle2 } from '@lucide/svelte';
  
  // Svelte 5 props
  let { videoBlob, maskedCount }: { videoBlob: Blob, maskedCount: number } = $props();

  let videoUrl = $derived(URL.createObjectURL(videoBlob));
  let isExiting = $state(false);
  let isDownloaded = $state(false);

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
    isDownloaded = true;
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
      {#if !isDownloaded}
        <button class="btn btn-secondary" onclick={handleClose}>
          Discard (Esc)
        </button>
        <button class="btn btn-primary" onclick={handleDownload}>
          <Download size={16} />
          Download .webm
        </button>
      {:else}
        <button class="btn btn-primary" onclick={handleClose}>
          Exit FixTheFlow
        </button>
      {/if}
    </div>
  </div>
</div>

<style>


  .overlay-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  }

  .overlay-container.exiting {
    animation: fadeOut 0.3s forwards;
  }

  .card {
    width: 440px;
    background-color: #ffffff;
    border-radius: 18px;
    border: 1px solid #e0e0e0;
    padding: 24px;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
    color: #1d1d1f;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .title {
    font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.374px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #7a7a7a;
    cursor: pointer;
    border-radius: 50%;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #f5f5f7;
    color: #1d1d1f;
  }

  .video-container {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    border: 1px solid #e0e0e0;
    margin-bottom: 24px;
    aspect-ratio: 16/9;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-panel {
    background: #f5f5f7;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    border: 1px solid transparent;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1d1d1f;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 6px;
    letter-spacing: -0.224px;
  }

  .status-desc {
    font-size: 14px;
    color: #7a7a7a;
    line-height: 1.43;
    margin: 0;
    letter-spacing: -0.224px;
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
    padding: 11px 22px;
    border-radius: 9999px;
    font-size: 17px;
    font-weight: 400;
    letter-spacing: -0.374px;
    cursor: pointer;
    border: none;
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .btn-secondary {
    background: transparent;
    color: #0066cc;
    border: 1px solid #0066cc;
  }

  .btn-secondary:hover {
    background: rgba(0, 102, 204, 0.05);
  }
  
  .btn-secondary:active {
    transform: scale(0.95);
  }

  .btn-primary {
    background: #0066cc;
    color: #ffffff;
  }

  .btn-primary:active {
    transform: scale(0.95);
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
