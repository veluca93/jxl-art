import { wrap, type Remote } from 'comlink';
import type { WorkerApi } from './lib/types';
import { helpContent } from './lib/help-content';
import { saveCode, loadCode } from './lib/storage';
import { getCodeFromUrl, copyShareUrl } from './lib/url';
import { presets } from './lib/presets';
import { highlightCode, getCompletions, HEADER_KEYWORDS, KEYWORDS, PROPERTIES, PREDICTORS } from './lib/syntax';

// DOM Elements
const codeEl = document.getElementById('code') as HTMLTextAreaElement;
const runBtn = document.getElementById('run') as HTMLButtonElement;
const shareBtn = document.getElementById('share') as HTMLButtonElement;
const prettierBtn = document.getElementById('prettier') as HTMLButtonElement;
const helpBtn = document.getElementById('help') as HTMLButtonElement;
const closeHelpBtn = document.getElementById('close-help') as HTMLButtonElement;
const helpDialog = document.getElementById('help-dialog') as HTMLDialogElement;
const helpContentEl = document.getElementById('help-content') as HTMLElement;
const previewImg = document.getElementById('preview') as HTMLImageElement;
const downloadJxlBtn = document.getElementById('download-jxl') as HTMLButtonElement;
const downloadPngBtn = document.getElementById('download-png') as HTMLButtonElement;
const sizeInfoEl = document.getElementById('size-info') as HTMLSpanElement | null;
const logEl = document.getElementById('log') as HTMLSpanElement;

// Zoom elements
const imageContainer = document.getElementById('image-container') as HTMLDivElement;
const imageWrapper = document.getElementById('image-wrapper') as HTMLDivElement;
const zoomLevelEl = document.getElementById('zoom-level') as HTMLSpanElement;
const zoomInBtn = document.getElementById('zoom-in') as HTMLButtonElement;
const zoomOutBtn = document.getElementById('zoom-out') as HTMLButtonElement;
const zoomFitBtn = document.getElementById('zoom-fit') as HTMLButtonElement;
const zoomResetBtn = document.getElementById('zoom-reset') as HTMLButtonElement;
const placeholderEl = document.querySelector('.placeholder') as HTMLDivElement;
const jxlSupportEl = document.getElementById('jxl-support') as HTMLSpanElement;
const lineNumbersEl = document.getElementById('line-numbers') as HTMLDivElement;
const codeHighlightEl = document.getElementById('code-highlight') as HTMLPreElement;
const autocompleteEl = document.getElementById('autocomplete') as HTMLDivElement;
const presetsBtn = document.getElementById('presets-btn') as HTMLButtonElement;
const presetsDialog = document.getElementById('presets-dialog') as HTMLDialogElement;
const presetsGrid = document.getElementById('presets-grid') as HTMLDivElement;
const closePresetsBtn = document.getElementById('close-presets') as HTMLButtonElement;
const mainEl = document.getElementById('main') as HTMLElement;
const resizerEl = document.getElementById('resizer') as HTMLDivElement;
const editorPanel = document.querySelector('.editor-panel') as HTMLDivElement;
const previewPanel = document.querySelector('.preview-panel') as HTMLDivElement;

// State
let worker: Remote<WorkerApi>;
let currentJxlData: Uint8Array | null = null;
let currentPngBlob: Blob | null = null;
let isRunning = false;
let supportsJxl = false;

// Detect native JXL support
async function detectJxlSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    // Add timeout in case browser hangs
    const timeout = setTimeout(() => resolve(false), 1000);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img.width === 1 && img.height === 1);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    // Valid 1x1 red JXL created with cjxl
    img.src = 'data:image/jxl;base64,/woAkAEAE4gCAMAAtZ8gAAAVKqOMG7yc6/nyQ4fFtI3rDG21bWEJY7O9MEhIOIONiwTfnKWRaQYkopIE';
  });
}

// Zoom state
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Initialize worker
function createWorker(): Remote<WorkerApi> {
  const workerInstance = new Worker(
    new URL('./workers/jxl-worker.ts', import.meta.url),
    { type: 'module' }
  );
  return wrap<WorkerApi>(workerInstance);
}

// Logging
function log(message: string, type: 'info' | 'error' | 'success' = 'info') {
  logEl.textContent = message;
  logEl.className = type;
}

// Run compilation
async function run() {
  if (isRunning) return;
  
  isRunning = true;
  document.body.classList.add('loading');
  runBtn.disabled = true;
  log('Compiling...', 'info');

  try {
    const code = codeEl.value;
    // Always generate PNG for download, even if we display JXL natively
    const result = await worker.render(code);
    
    currentJxlData = result.jxlData;
    
    // Display - use native JXL if supported, otherwise PNG
    // Force PNG for 16BitBuffers (browsers can't display natively)
    const uses16Bit = /^\s*16BitBuffers\b/im.test(code);
    let displayBlob: Blob;
    if (supportsJxl && !uses16Bit) {
      displayBlob = new Blob([new Uint8Array(result.jxlData)], { type: 'image/jxl' });
      currentPngBlob = null; // PNG not generated when using native JXL
    } else {
      currentPngBlob = new Blob([new Uint8Array(result.pngData)], { type: 'image/png' });
      displayBlob = currentPngBlob;
    }
    const url = URL.createObjectURL(displayBlob);
    previewImg.src = url;
    placeholderEl.classList.add('hidden');
    
    // Fit to view once image loads
    previewImg.onload = () => fitToView();
    
    // Update UI
    downloadJxlBtn.disabled = false;
    downloadPngBtn.disabled = false; // Always enable - convert on demand
    if (sizeInfoEl) {
      sizeInfoEl.textContent = `JXL: ${result.jxlData.byteLength} bytes${supportsJxl ? ' (native)' : ''}`;
    }
    
    log(`Success! JXL size: ${result.jxlData.byteLength} bytes`, 'success');
    
    // Save code
    await saveCode(code);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    log(message, 'error');
    console.error(e);
    
    // Disable download buttons on error
    downloadJxlBtn.disabled = true;
    downloadPngBtn.disabled = true;
    if (sizeInfoEl) {
      sizeInfoEl.textContent = '';
    }
  } finally {
    isRunning = false;
    document.body.classList.remove('loading');
    runBtn.disabled = false;
  }
}

// Download helpers
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Event Handlers
runBtn.addEventListener('click', run);
shareBtn.addEventListener('click', handleShare);
prettierBtn.addEventListener('click', handlePrettify);

helpBtn.addEventListener('click', () => {
  helpContentEl.innerHTML = helpContent;
  helpDialog.showModal();
});

closeHelpBtn.addEventListener('click', () => {
  helpDialog.close();
});

downloadJxlBtn.addEventListener('click', () => {
  if (currentJxlData) {
    downloadBlob(new Blob([new Uint8Array(currentJxlData)], { type: 'image/jxl' }), 'art.jxl');
  }
});

downloadPngBtn.addEventListener('click', async () => {
  if (currentPngBlob) {
    downloadBlob(currentPngBlob, 'art.png');
  } else if (currentJxlData && supportsJxl) {
    // Convert JXL to PNG on demand (when using native JXL preview)
    log('Converting to PNG...', 'info');
    try {
      const result = await worker.render(codeEl.value);
      const pngBlob = new Blob([new Uint8Array(result.pngData)], { type: 'image/png' });
      downloadBlob(pngBlob, 'art.png');
      log('PNG downloaded', 'success');
    } catch (e) {
      log('Failed to convert to PNG', 'error');
    }
  }
});

// Keyboard shortcut
codeEl.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.code === 'Enter') {
    e.preventDefault();
    run();
  }
});

// Update line numbers and syntax highlighting
function updateEditor() {
  // Line numbers
  const lines = codeEl.value.split('\n').length;
  const numbers = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('');
  lineNumbersEl.innerHTML = numbers;
  
  // Syntax highlighting
  codeHighlightEl.innerHTML = highlightCode(codeEl.value) + '\n'; // Extra newline for cursor space
}

// Sync scroll between all editor elements
codeEl.addEventListener('scroll', () => {
  lineNumbersEl.scrollTop = codeEl.scrollTop;
  codeHighlightEl.scrollTop = codeEl.scrollTop;
  codeHighlightEl.scrollLeft = codeEl.scrollLeft;
});

// Autocomplete state
let autocompleteItems: string[] = [];
let autocompleteIndex = 0;

function showAutocomplete(items: string[]) {
  if (items.length === 0) {
    hideAutocomplete();
    return;
  }
  
  autocompleteItems = items;
  autocompleteIndex = 0;
  
  // Get cursor position
  const cursorPos = codeEl.selectionStart;
  const textBefore = codeEl.value.substring(0, cursorPos);
  const lines = textBefore.split('\n');
  const currentLine = lines.length - 1;
  const currentCol = lines[lines.length - 1].length;
  
  // Position autocomplete
  const lineHeight = 19.5; // 13px * 1.5 line-height
  const charWidth = 7.8; // approximate for monospace
  const top = (currentLine + 1) * lineHeight + 16; // 16px padding
  const left = currentCol * charWidth + 16;
  
  autocompleteEl.style.top = `${Math.min(top, codeEl.offsetHeight - 100)}px`;
  autocompleteEl.style.left = `${Math.min(left, codeEl.offsetWidth - 160)}px`;
  
  renderAutocomplete();
  autocompleteEl.classList.remove('hidden');
}

function hideAutocomplete() {
  autocompleteEl.classList.add('hidden');
  autocompleteItems = [];
}

function renderAutocomplete() {
  autocompleteEl.innerHTML = autocompleteItems.map((item, i) => {
    let typeClass = '';
    let typeName = '';
    
    if (KEYWORDS.includes(item as any)) {
      typeClass = 'type-keyword';
      typeName = 'keyword';
    } else if (HEADER_KEYWORDS.includes(item as any)) {
      typeClass = 'type-header';
      typeName = 'header';
    } else if (PROPERTIES.includes(item as any)) {
      typeClass = 'type-property';
      typeName = 'prop';
    } else if (PREDICTORS.includes(item as any)) {
      typeClass = 'type-predictor';
      typeName = 'pred';
    }
    
    return `<div class="autocomplete-item${i === autocompleteIndex ? ' selected' : ''}" data-index="${i}">
      <span>${item}</span>
      ${typeName ? `<span class="type ${typeClass}">${typeName}</span>` : ''}
    </div>`;
  }).join('');
}

function applyAutocomplete() {
  if (autocompleteItems.length === 0) return;
  
  const item = autocompleteItems[autocompleteIndex];
  const cursorPos = codeEl.selectionStart;
  const textBefore = codeEl.value.substring(0, cursorPos);
  const textAfter = codeEl.value.substring(cursorPos);
  
  // Find the word we're completing
  const match = textBefore.match(/[\w\-|]*$/);
  const wordStart = match ? cursorPos - match[0].length : cursorPos;
  
  codeEl.value = codeEl.value.substring(0, wordStart) + item + textAfter;
  codeEl.selectionStart = codeEl.selectionEnd = wordStart + item.length;
  
  hideAutocomplete();
  updateEditor();
  saveCode(codeEl.value);
}

// Editor keyboard handling
codeEl.addEventListener('keydown', (e) => {
  // Autocomplete navigation
  if (!autocompleteEl.classList.contains('hidden')) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      autocompleteIndex = (autocompleteIndex + 1) % autocompleteItems.length;
      renderAutocomplete();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      autocompleteIndex = (autocompleteIndex - 1 + autocompleteItems.length) % autocompleteItems.length;
      renderAutocomplete();
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applyAutocomplete();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideAutocomplete();
      return;
    }
  }
  
  // Tab key inserts spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = codeEl.selectionStart;
    const end = codeEl.selectionEnd;
    codeEl.value = codeEl.value.substring(0, start) + '  ' + codeEl.value.substring(end);
    codeEl.selectionStart = codeEl.selectionEnd = start + 2;
    updateEditor();
    saveCode(codeEl.value);
  }
});

// Code change - save, update editor, and show autocomplete
codeEl.addEventListener('input', () => {
  saveCode(codeEl.value);
  updateEditor();
  
  // Trigger autocomplete
  const cursorPos = codeEl.selectionStart;
  const textBefore = codeEl.value.substring(0, cursorPos);
  const currentLine = textBefore.split('\n').pop() || '';
  
  // Only show autocomplete if we're typing a word (not just whitespace)
  const match = currentLine.match(/[\w\-|]+$/);
  if (match && match[0].length >= 1) {
    const completions = getCompletions(currentLine, currentLine.length);
    showAutocomplete(completions.slice(0, 8)); // Limit to 8 items
  } else {
    hideAutocomplete();
  }
});

// Click on autocomplete item
autocompleteEl.addEventListener('click', (e) => {
  const item = (e.target as HTMLElement).closest('.autocomplete-item');
  if (item) {
    autocompleteIndex = parseInt(item.getAttribute('data-index') || '0');
    applyAutocomplete();
  }
});

// Hide autocomplete when clicking outside
codeEl.addEventListener('blur', () => {
  setTimeout(hideAutocomplete, 150); // Delay to allow click on autocomplete
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter = Run
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    run();
  }
  // Ctrl/Cmd + S = Share
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleShare();
  }
  // Ctrl/Cmd + Shift + F = Prettify
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
    e.preventDefault();
    handlePrettify();
  }
  // Escape = Close dialogs
  if (e.key === 'Escape') {
    if (helpDialog.open) helpDialog.close();
    if (presetsDialog.open) presetsDialog.close();
  }
});

async function handleShare() {
  try {
    await copyShareUrl(codeEl.value);
    log('Share URL copied to clipboard!', 'success');
  } catch {
    log('Failed to copy URL', 'error');
  }
}

async function handlePrettify() {
  try {
    const formatted = await worker.prettier(codeEl.value);
    codeEl.value = formatted;
    saveCode(formatted);
    log('Code formatted', 'success');
  } catch {
    log('Failed to format code', 'error');
  }
}

// Presets modal
presetsBtn.addEventListener('click', () => {
  presetsDialog.showModal();
});

closePresetsBtn.addEventListener('click', () => {
  presetsDialog.close();
});

presetsDialog.addEventListener('click', (e) => {
  if (e.target === presetsDialog) {
    presetsDialog.close();
  }
});

// Handle preset selection
presetsGrid.addEventListener('click', (e) => {
  const card = (e.target as HTMLElement).closest('.preset-card');
  if (!card) return;
  
  const presetName = card.getAttribute('data-preset');
  const preset = presets.find(p => p.name === presetName);
  if (preset) {
    codeEl.value = preset.code;
    updateEditor();
    saveCode(preset.code);
    presetsDialog.close();
    log(`Loaded preset: ${preset.name}`, 'info');
    run();
  }
});

// Zoom functions
function updateZoom() {
  imageWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  zoomLevelEl.textContent = `${Math.round(zoomLevel * 100)}%`;
}

function zoomTo(level: number, centerX?: number, centerY?: number) {
  const oldZoom = zoomLevel;
  zoomLevel = Math.max(0.1, Math.min(10, level));
  
  if (centerX !== undefined && centerY !== undefined) {
    const rect = imageContainer.getBoundingClientRect();
    const cx = centerX - rect.left - rect.width / 2;
    const cy = centerY - rect.top - rect.height / 2;
    const scale = zoomLevel / oldZoom;
    panX = cx - (cx - panX) * scale;
    panY = cy - (cy - panY) * scale;
  }
  
  updateZoom();
}

function fitToView() {
  if (!previewImg.naturalWidth) return;
  const rect = imageContainer.getBoundingClientRect();
  const scaleX = (rect.width - 20) / previewImg.naturalWidth;
  const scaleY = (rect.height - 60) / previewImg.naturalHeight;
  zoomLevel = Math.min(scaleX, scaleY, 1);
  panX = 0;
  panY = 0;
  updateZoom();
}

// Zoom controls
zoomInBtn.addEventListener('click', () => zoomTo(zoomLevel * 1.25));
zoomOutBtn.addEventListener('click', () => zoomTo(zoomLevel / 1.25));
zoomResetBtn.addEventListener('click', () => {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  updateZoom();
});
zoomFitBtn.addEventListener('click', fitToView);

// Mouse wheel zoom
imageContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  zoomTo(zoomLevel * delta, e.clientX, e.clientY);
}, { passive: false });

// Pan with mouse drag
imageContainer.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isPanning = true;
  startPanX = e.clientX - panX;
  startPanY = e.clientY - panY;
  imageContainer.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  panX = e.clientX - startPanX;
  panY = e.clientY - startPanY;
  updateZoom();
});

window.addEventListener('mouseup', () => {
  isPanning = false;
  imageContainer.style.cursor = '';
});

// Touch support
let lastTouchDist = 0;
let lastTouchX = 0;
let lastTouchY = 0;

imageContainer.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isPanning = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isPanning = false;
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}, { passive: true });

imageContainer.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && isPanning) {
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    panX += dx;
    panY += dy;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    updateZoom();
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    zoomTo(zoomLevel * (dist / lastTouchDist), centerX, centerY);
    lastTouchDist = dist;
  }
}, { passive: true });

imageContainer.addEventListener('touchend', () => {
  isPanning = false;
});

// Panel resizer
let isResizing = false;

resizerEl.addEventListener('mousedown', (e) => {
  isResizing = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  
  const mainRect = mainEl.getBoundingClientRect();
  const isVertical = window.innerWidth <= 900;
  
  if (isVertical) {
    const offsetY = e.clientY - mainRect.top;
    const totalHeight = mainRect.height;
    const percentage = (offsetY / totalHeight) * 100;
    const clamped = Math.max(15, Math.min(85, percentage));
    
    editorPanel.style.flex = `0 0 ${clamped}%`;
    previewPanel.style.flex = `0 0 ${100 - clamped - 2}%`;
  } else {
    const offsetX = e.clientX - mainRect.left;
    const totalWidth = mainRect.width;
    const percentage = (offsetX / totalWidth) * 100;
    const clamped = Math.max(15, Math.min(85, percentage));
    
    editorPanel.style.flex = `0 0 ${clamped}%`;
    previewPanel.style.flex = `0 0 ${100 - clamped - 2}%`;
  }
});

window.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// Touch support for resizer
resizerEl.addEventListener('touchstart', (e) => {
  isResizing = true;
  e.preventDefault();
});

window.addEventListener('touchmove', (e) => {
  if (!isResizing || e.touches.length !== 1) return;
  
  const touch = e.touches[0];
  const mainRect = mainEl.getBoundingClientRect();
  const isVertical = window.innerWidth <= 900;
  
  if (isVertical) {
    const offsetY = touch.clientY - mainRect.top;
    const totalHeight = mainRect.height;
    const percentage = (offsetY / totalHeight) * 100;
    const clamped = Math.max(15, Math.min(85, percentage));
    
    editorPanel.style.flex = `0 0 ${clamped}%`;
    previewPanel.style.flex = `0 0 ${100 - clamped - 2}%`;
  } else {
    const offsetX = touch.clientX - mainRect.left;
    const totalWidth = mainRect.width;
    const percentage = (offsetX / totalWidth) * 100;
    const clamped = Math.max(15, Math.min(85, percentage));
    
    editorPanel.style.flex = `0 0 ${clamped}%`;
    previewPanel.style.flex = `0 0 ${100 - clamped - 2}%`;
  }
});

window.addEventListener('touchend', () => {
  isResizing = false;
});

// Generate preview for a preset
async function generatePresetPreview(code: string): Promise<string> {
  try {
    const result = await worker.render(code);
    const blob = supportsJxl 
      ? new Blob([new Uint8Array(result.jxlData)], { type: 'image/jxl' })
      : new Blob([new Uint8Array(result.pngData)], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch {
    return ''; // Return empty on error
  }
}

// Populate presets grid with previews
async function populatePresets() {
  // Create cards with placeholder first
  presets.forEach(preset => {
    const card = document.createElement('div');
    card.className = 'preset-card loading';
    card.setAttribute('data-preset', preset.name);
    card.innerHTML = `
      <img src="" alt="${preset.name}" />
      <p class="preset-name">${preset.name}</p>
      <p class="preset-desc">${preset.description}</p>
    `;
    presetsGrid.appendChild(card);
  });

  // Generate previews in background
  for (const preset of presets) {
    const card = presetsGrid.querySelector(`[data-preset="${preset.name}"]`);
    if (!card) continue;
    
    const imgUrl = await generatePresetPreview(preset.code);
    const img = card.querySelector('img');
    if (img && imgUrl) {
      img.src = imgUrl;
    }
    card.classList.remove('loading');
  }
}

// Initialize
async function init() {
  worker = createWorker();
  
  // Populate presets
  populatePresets();
  
  // Detect native JXL support
  supportsJxl = await detectJxlSupport();
  if (supportsJxl) {
    console.log('[JXL Art] Native JXL support detected - using JXL for preview');
    jxlSupportEl.classList.remove('hidden');
  } else {
    console.log('[JXL Art] No native JXL support - using PNG for preview');
  }
  
  // Load code: URL > saved > default
  const urlCode = getCodeFromUrl();
  if (urlCode) {
    codeEl.value = urlCode;
  } else {
    const savedCode = await loadCode();
    if (savedCode) {
      codeEl.value = savedCode;
    }
  }
  
  // Initialize line numbers
  updateEditor();
  
  log('Ready. Press Ctrl+Enter to generate image.', 'info');
  
  // Auto-run if code came from URL
  if (urlCode) {
    run();
  }
}

init();
