<script lang="ts">
  import { Square, Pen, GripHorizontal } from '@lucide/svelte';

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
    toolbarElement.style.left = `${initialLeft + dx}px`;
    toolbarElement.style.top = `${initialTop + dy}px`;
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
      <GripHorizontal size={16} />
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .toolbar {
    background-color: #121215;
    border: 1px solid #2A2A32;
    border-radius: 100px;
    padding: 8px 12px 8px 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
  }

  .drag-handle {
    cursor: grab;
    color: #8E8E93;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
  }

  .drag-handle:hover {
    background: #2A2A32;
    color: #F5F5F7;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #F5F5F7;
    font-size: 14px;
    font-weight: 500;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #FF3B30;
    animation: pulse 1.5s infinite;
  }

  .divider {
    width: 1px;
    height: 16px;
    background-color: #2A2A32;
  }

  .draw-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #8E8E93;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .draw-btn:hover {
    background: #2A2A32;
    color: #F5F5F7;
  }

  .draw-btn.active {
    background: rgba(0, 122, 255, 0.15);
    color: #007AFF;
  }

  .stop-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    color: #FF3B30;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 100px;
    transition: background 0.2s;
  }

  .stop-btn:hover {
    background: rgba(255, 59, 48, 0.1);
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
