<script lang="ts">
  import { Square, Pen } from '@lucide/svelte';

  let isDrawing = $state(false);
  let toolbarElement: HTMLElement | null = null;

  // Dragging state
  let isDragging = $state(false);
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  function stopRecording() {
    chrome.runtime.sendMessage({ action: 'STOP_CAPTURE' });
  }

  function toggleDrawing() {
    isDrawing = !isDrawing;
    window.dispatchEvent(new CustomEvent('FIXTHEFLOW_TOGGLE_DRAWING', { detail: { isDrawing } }));
  }

  function onDragStart(e: MouseEvent) {
    if (!toolbarElement) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const style = window.getComputedStyle(toolbarElement);
    
    // Switch to absolute positioning during first drag
    if (toolbarElement.style.transform !== 'none') {
      const rect = toolbarElement.getBoundingClientRect();
      toolbarElement.style.transform = 'none';
      toolbarElement.style.left = `${rect.left}px`;
      toolbarElement.style.top = `${rect.top}px`;
      toolbarElement.style.bottom = 'auto';
      initialLeft = rect.left;
      initialTop = rect.top;
    } else {
      initialLeft = parseInt(style.left, 10);
      initialTop = parseInt(style.top, 10);
    }

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging || !toolbarElement) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;
    
    // Bounds prevention
    const rect = toolbarElement.getBoundingClientRect();
    const margin = 12;
    newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - rect.width - margin));
    newTop = Math.max(margin, Math.min(newTop, window.innerHeight - rect.height - margin));

    toolbarElement.style.left = `${newLeft}px`;
    toolbarElement.style.top = `${newTop}px`;
  }

  function onDragEnd() {
    isDragging = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', onDragEnd);
  }
</script>

<div class="toolbar-container" bind:this={toolbarElement}>
  <div class="toolbar">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="drag-handle" onmousedown={onDragStart}>
      <div class="custom-grip">
        <div class="grip-dot"></div>
        <div class="grip-dot"></div>
        <div class="grip-dot"></div>
        <div class="grip-dot"></div>
        <div class="grip-dot"></div>
        <div class="grip-dot"></div>
      </div>
    </div>

    <div class="recording-indicator">
      <div class="dot"></div>
      <span>Recording UX...</span>
    </div>
    
    <div class="divider"></div>
    
    <button class="draw-btn" class:active={isDrawing} onclick={toggleDrawing} title="Toggle Draw Mode">
      <Pen size={16} />
    </button>

    <div class="divider"></div>

    <button class="stop-btn" onclick={stopRecording}>
      <Square size={14} fill="currentColor" />
      Stop
    </button>
  </div>
</div>

<style>
  .toolbar-container {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    pointer-events: none;
    font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  }

  .toolbar {
    background: rgba(245, 245, 247, 0.8);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid #e0e0e0;
    border-radius: 9999px;
    padding: 8px 12px 8px 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    pointer-events: auto;
  }

  .drag-handle {
    cursor: grab;
    color: #7a7a7a;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
  }

  .custom-grip {
    display: grid;
    grid-template-columns: repeat(2, 3px);
    gap: 3px;
    padding: 2px;
  }

  .grip-dot {
    width: 3px;
    height: 3px;
    background-color: #7a7a7a;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .drag-handle:hover {
    background: #e8e8ed;
  }

  .drag-handle:hover .grip-dot {
    background-color: #1d1d1f;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.224px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0066cc; /* Subdued primary blue indicator */
    animation: pulse 1.5s infinite;
  }

  .divider {
    width: 1px;
    height: 16px;
    background-color: #e0e0e0;
  }

  .draw-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #7a7a7a;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .draw-btn:hover {
    background: #e8e8ed;
    color: #1d1d1f;
  }

  .draw-btn.active {
    background: rgba(0, 102, 204, 0.1);
    color: #0066cc;
  }

  .stop-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ff3b30;
    color: #ffffff;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.224px;
    padding: 8px 15px;
    border-radius: 9999px;
    transition: transform 0.15s ease;
  }

  .stop-btn:active {
    transform: scale(0.95);
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
