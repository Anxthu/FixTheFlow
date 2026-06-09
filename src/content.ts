import { mount, unmount } from 'svelte';
import Overlay from './components/Overlay.svelte';
import Toolbar from './components/Toolbar.svelte';
import SetupBar from './components/SetupBar.svelte';

let recording = false;
let isSetupMode = false;
let masks: HTMLElement[] = [];
let currentMaskedCount = 0;

let toolbarContainer: HTMLElement | null = null;
let toolbarComponent: any = null;

let setupBarContainer: HTMLElement | null = null;
let setupBarComponent: any = null;

let drawingCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let isDrawingMode = false;
let isPainting = false;
let lastX = 0;
let lastY = 0;

// Hover logic for setup mode
let hoverHighlight: HTMLElement | null = null;

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'ENTER_SETUP') {
    if (isSetupMode || recording) return;
    isSetupMode = true;
    
    // Auto blur fields
    applyAutoMasks();
    
    // Show Setup bar
    showSetupBar();
    
    // Enable manual blurring
    enableManualMasking();
  }

  if (message.action === 'START_RECORDING_PHASE') {
    isSetupMode = false;
    recording = true;
    
    disableManualMasking();
    hideSetupBar();
    
    showToolbar();
    setupDrawingCanvas();
    
    chrome.runtime.sendMessage({ action: 'MASKS_APPLIED' });
  }

  if (message.action === 'SHOW_OVERLAY') {
    recording = false;
    cleanupMasks();
    hideToolbar();
    teardownDrawingCanvas();
    
    const videoBase64 = message.videoBase64;
    fetch(videoBase64)
      .then(res => res.blob())
      .then(blob => {
        showOverlay(blob, currentMaskedCount);
      })
      .catch(err => {
        console.error("Failed to decode video blob", err);
      });
  }
});

// -- Drawing Logic --
window.addEventListener('FIXTHEFLOW_TOGGLE_DRAWING', (e: any) => {
  isDrawingMode = e.detail.isDrawing;
  if (drawingCanvas) {
    drawingCanvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
  }
});

function setupDrawingCanvas() {
  drawingCanvas = document.createElement('canvas');
  drawingCanvas.id = 'fixtheflow-drawing-canvas';
  drawingCanvas.width = window.innerWidth;
  drawingCanvas.height = window.innerHeight;
  drawingCanvas.style.position = 'fixed';
  drawingCanvas.style.top = '0';
  drawingCanvas.style.left = '0';
  drawingCanvas.style.zIndex = '2147483645'; // Below toolbar but above masks
  drawingCanvas.style.pointerEvents = 'none'; // Initially off
  document.body.appendChild(drawingCanvas);

  ctx = drawingCanvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = '#FF3B30'; // Red
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  drawingCanvas.addEventListener('mousedown', startDrawing);
  drawingCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  if (!drawingCanvas) return;
  drawingCanvas.width = window.innerWidth;
  drawingCanvas.height = window.innerHeight;
  if (ctx) {
    ctx.strokeStyle = '#FF3B30';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
}

function startDrawing(e: MouseEvent) {
  if (!isDrawingMode) return;
  isPainting = true;
  lastX = e.clientX;
  lastY = e.clientY;
}

function draw(e: MouseEvent) {
  if (!isPainting || !isDrawingMode || !ctx) return;
  
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  
  lastX = e.clientX;
  lastY = e.clientY;
}

function stopDrawing() {
  isPainting = false;
}

function teardownDrawingCanvas() {
  if (drawingCanvas) {
    drawingCanvas.removeEventListener('mousedown', startDrawing);
    drawingCanvas.removeEventListener('mousemove', draw);
    window.removeEventListener('mouseup', stopDrawing);
    window.removeEventListener('resize', handleResize);
    drawingCanvas.remove();
    drawingCanvas = null;
    ctx = null;
  }
  isDrawingMode = false;
  isPainting = false;
}

// -- Masking Logic --
function applyAutoMasks() {
  // Expanded selectors
  const selectors = [
    'input[type="password"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[name*="phone"]',
    'input[name*="card"]',
    'input[name*="cvv"]',
    '.card-number'
  ].join(', ');
  
  const sensitiveElements = document.querySelectorAll(selectors);
  
  sensitiveElements.forEach((el) => {
    applyMaskToElement(el as HTMLElement);
  });
}

function applyMaskToElement(el: HTMLElement) {
  // Prevent double masking
  if (el.dataset.fixtheflowMasked) return;
  el.dataset.fixtheflowMasked = 'true';

  const rect = el.getBoundingClientRect();
  const mask = document.createElement('div');
  mask.style.position = 'absolute';
  mask.style.top = `${rect.top + window.scrollY}px`;
  mask.style.left = `${rect.left + window.scrollX}px`;
  mask.style.width = `${rect.width}px`;
  mask.style.height = `${rect.height}px`;
  mask.style.backdropFilter = 'blur(12px)';
  mask.style.backgroundColor = 'rgba(255,255,255,0.1)';
  mask.style.zIndex = '2147483644';
  mask.style.borderRadius = getComputedStyle(el).borderRadius || '6px';
  mask.style.pointerEvents = 'none'; // so clicks pass through if needed
  
  document.body.appendChild(mask);
  masks.push(mask);
  currentMaskedCount = masks.length;
}

// -- Manual Masking Hover Logic --
function enableManualMasking() {
  hoverHighlight = document.createElement('div');
  hoverHighlight.style.position = 'absolute';
  hoverHighlight.style.pointerEvents = 'none';
  hoverHighlight.style.border = '2px dashed #007AFF';
  hoverHighlight.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
  hoverHighlight.style.zIndex = '2147483646';
  hoverHighlight.style.display = 'none';
  document.body.appendChild(hoverHighlight);

  window.addEventListener('mousemove', handleHover);
  window.addEventListener('click', handleClick, true);
}

function disableManualMasking() {
  if (hoverHighlight) {
    hoverHighlight.remove();
    hoverHighlight = null;
  }
  window.removeEventListener('mousemove', handleHover);
  window.removeEventListener('click', handleClick, true);
}

function handleHover(e: MouseEvent) {
  if (!hoverHighlight || !isSetupMode) return;
  
  const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
  if (!target || target === document.body || target === document.documentElement) {
    hoverHighlight.style.display = 'none';
    return;
  }

  // Ignore extension UI
  if (target.closest('#fixtheflow-setup-bar') || target.closest('#fixtheflow-toolbar')) {
    hoverHighlight.style.display = 'none';
    return;
  }

  const rect = target.getBoundingClientRect();
  hoverHighlight.style.display = 'block';
  hoverHighlight.style.top = `${rect.top + window.scrollY}px`;
  hoverHighlight.style.left = `${rect.left + window.scrollX}px`;
  hoverHighlight.style.width = `${rect.width}px`;
  hoverHighlight.style.height = `${rect.height}px`;
}

function handleClick(e: MouseEvent) {
  if (!isSetupMode) return;

  const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
  if (!target) return;

  // If clicking setup bar, let it pass
  if (target.closest('#fixtheflow-setup-bar')) return;

  e.preventDefault();
  e.stopPropagation();

  if (target !== document.body && target !== document.documentElement) {
    applyMaskToElement(target);
  }
}

function cleanupMasks() {
  masks.forEach(m => m.remove());
  masks = [];
  currentMaskedCount = 0;
  // Remove data attributes
  document.querySelectorAll('[data-fixtheflow-masked]').forEach(el => {
    delete (el as HTMLElement).dataset.fixtheflowMasked;
  });
}

// -- UI Mounting --
function showSetupBar() {
  setupBarContainer = document.createElement('div');
  setupBarContainer.id = 'fixtheflow-setup-bar';
  document.body.appendChild(setupBarContainer);

  setupBarComponent = mount(SetupBar, { target: setupBarContainer });
}

function hideSetupBar() {
  if (setupBarComponent) unmount(setupBarComponent);
  if (setupBarContainer) setupBarContainer.remove();
  setupBarComponent = null;
  setupBarContainer = null;
}

function showToolbar() {
  toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'fixtheflow-toolbar';
  document.body.appendChild(toolbarContainer);

  toolbarComponent = mount(Toolbar, { target: toolbarContainer });
}

function hideToolbar() {
  if (toolbarComponent) unmount(toolbarComponent);
  if (toolbarContainer) toolbarContainer.remove();
  toolbarComponent = null;
  toolbarContainer = null;
}

function showOverlay(videoBlob: Blob, maskedCount: number) {
  const container = document.createElement('div');
  container.id = 'fixtheflow-root';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '2147483647';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  mount(Overlay, {
    target: container,
    props: { videoBlob, maskedCount }
  });
}
