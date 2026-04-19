/* ============================================================
   Image Captioning AI – script.js
   CodeSoft Task 3
   Uses @huggingface/transformers (Transformers.js)
   Model runs 100% in the browser via ONNX/WASM — no API calls.
   ============================================================ */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1';

/* ─── Config ─────────────────────────────────────────────── */
const MODEL_ID      = 'Xenova/vit-gpt2-image-captioning';
const MAX_FILE_MB   = 10;
const LOADING_MSGS  = [
  'Running Vision Transformer…',
  'Extracting image features…',
  'Generating caption with GPT-2…',
  'Decoding tokens…',
  'Almost there…',
];

/* ─── Samples (Unsplash) ─────────────────────────────────── */
const SAMPLES = [
  { url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=70', label: 'Golden Retriever' },
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70', label: 'Mountain Lake' },
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70', label: 'Gourmet Food' },
  { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=70', label: 'Snowy Mountain' },
  { url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=70', label: 'Happy Dog' },
  { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=70', label: 'Laptop / Code' },
];

/* ─── State ──────────────────────────────────────────────── */
let captioner   = null;   // pipeline instance (loaded once)
let modelReady  = false;
let isLoading   = false;
let currentDataUrl = null; // data-URL of the loaded image

/* ─── DOM refs ───────────────────────────────────────────── */
const modelBanner    = document.getElementById('model-banner');
const modelTitle     = document.getElementById('model-title');
const modelSubtitle  = document.getElementById('model-subtitle');
const progressBar    = document.getElementById('progress-bar');
const progressLabel  = document.getElementById('progress-label');
const modelStatusDot = document.getElementById('model-status-dot');

const dropZone       = document.getElementById('drop-zone');
const fileInput      = document.getElementById('file-input');
const uploadIdle     = document.getElementById('upload-idle');
const uploadPreview  = document.getElementById('upload-preview');
const previewImg     = document.getElementById('preview-img');
const removeBtn      = document.getElementById('remove-btn');
const generateBtn    = document.getElementById('generate-btn');
const generateBtnTxt = document.getElementById('generate-btn-text');

const resultCard     = document.getElementById('result-card');
const resultLoading  = document.getElementById('result-loading');
const resultOutput   = document.getElementById('result-output');
const resultError    = document.getElementById('result-error');
const loadingText    = document.getElementById('loading-text');
const captionText    = document.getElementById('caption-text');
const captionMeta    = document.getElementById('caption-meta');
const errorMsg       = document.getElementById('error-msg');
const copyBtn        = document.getElementById('copy-btn');
const retryBtn       = document.getElementById('retry-btn');
const sampleGallery  = document.getElementById('sample-gallery');

/* ─── Model loading ──────────────────────────────────────── */
async function loadModel() {
  try {
    setModelStatus('loading', 'Loading AI model…', 'Connecting to Hugging Face Hub…');
    updateProgress(0, 'Initialising ONNX runtime…');

    // Let Transformers.js use its default caching (IndexedDB)
    env.allowLocalModels = false;

    captioner = await pipeline('image-to-text', MODEL_ID, {
      progress_callback: onProgress,
    });

    modelReady = true;
    setModelStatus('ready', '✅ Model ready', 'Xenova/vit-gpt2-image-captioning — cached in browser');
    updateProgress(100, 'Ready!');
    updateGenerateBtn();

  } catch (err) {
    setModelStatus('error', '❌ Failed to load model', err.message);
    progressLabel.textContent = 'Load failed — check internet connection and refresh.';
  }
}

function onProgress({ status, file, loaded, total, name }) {
  if (status === 'initiate') {
    updateProgress(0, `Downloading ${file || name || 'model files'}…`);
  } else if (status === 'download') {
    updateProgress(0, `Fetching ${file}…`);
  } else if (status === 'progress') {
    const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const mb  = (loaded / 1024 / 1024).toFixed(1);
    const tot = total > 0 ? `/ ${(total / 1024 / 1024).toFixed(1)} MB` : '';
    updateProgress(pct, `${file || 'model'}: ${mb} MB ${tot} (${pct}%)`);
  } else if (status === 'done') {
    updateProgress(100, `${file || 'model'} ✓`);
  } else if (status === 'ready') {
    updateProgress(100, 'All files loaded ✓');
  }
}

function updateProgress(pct, label) {
  progressBar.style.width  = `${pct}%`;
  progressLabel.textContent = label;
}

function setModelStatus(state, title, subtitle) {
  modelTitle.textContent    = title;
  modelSubtitle.textContent = subtitle;
  modelBanner.dataset.state = state;
  modelStatusDot.dataset.state = state;
}

/* ─── Upload listeners ──────────────────────────────────── */
function attachListeners() {
  dropZone.addEventListener('click', handleZoneClick);
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') handleZoneClick();
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
  });
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });
  removeBtn.addEventListener('click', e => { e.stopPropagation(); clearImage(); });
  generateBtn.addEventListener('click', generateCaption);
  copyBtn.addEventListener('click', copyCaption);
  retryBtn.addEventListener('click', generateCaption);
}

function handleZoneClick() {
  if (!dropZone.classList.contains('has-image')) fileInput.click();
}

/* ─── File loading ──────────────────────────────────────── */
function loadFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file.', 'warning');
    return;
  }
  if (file.size / 1024 / 1024 > MAX_FILE_MB) {
    showToast(`File too large (max ${MAX_FILE_MB} MB).`, 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    currentDataUrl = e.target.result;
    showPreview(currentDataUrl);
  };
  reader.readAsDataURL(file);
}

async function loadFromUrl(imgUrl) {
  try {
    showToast('Loading sample image…', 'info');
    const res  = await fetch(imgUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = e => {
      currentDataUrl = e.target.result;
      showPreview(currentDataUrl);
    };
    reader.readAsDataURL(blob);
  } catch {
    showToast('Could not load sample image.', 'warning');
  }
}

function showPreview(src) {
  previewImg.src = src;
  uploadIdle.classList.add('hidden');
  uploadPreview.classList.remove('hidden');
  dropZone.classList.add('has-image');
  hideResult();
  updateGenerateBtn();
}

function clearImage() {
  currentDataUrl = null;
  previewImg.src = '';
  fileInput.value = '';
  uploadPreview.classList.add('hidden');
  uploadIdle.classList.remove('hidden');
  dropZone.classList.remove('has-image');
  hideResult();
  updateGenerateBtn();
}

function updateGenerateBtn() {
  generateBtn.disabled = !(modelReady && currentDataUrl);
}

/* ─── Caption generation ─────────────────────────────────── */
async function generateCaption() {
  if (isLoading || !modelReady || !currentDataUrl) return;
  isLoading = true;

  showResultCard('loading');
  animateLoadingText();
  generateBtnTxt.textContent = 'Generating…';
  generateBtn.disabled = true;

  const startTime = Date.now();

  try {
    // Transformers.js pipeline accepts a data-URL directly
    const output  = await captioner(currentDataUrl, { max_new_tokens: 100 });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!output || !output[0]?.generated_text) {
      throw new Error('Model returned an empty result. Please try another image.');
    }

    displayCaption(output[0].generated_text, elapsed);

  } catch (err) {
    displayError(err.message || 'Inference failed. Please try again.');
  } finally {
    clearInterval(loadingInterval);
    isLoading = false;
    generateBtnTxt.textContent = 'Generate Caption';
    updateGenerateBtn();
  }
}

/* ─── Result display ─────────────────────────────────────── */
function showResultCard(state) {
  resultCard.classList.remove('hidden');
  resultLoading.classList.add('hidden');
  resultOutput.classList.add('hidden');
  resultError.classList.add('hidden');
  if (state === 'loading') resultLoading.classList.remove('hidden');
  else if (state === 'output') resultOutput.classList.remove('hidden');
  else if (state === 'error')  resultError.classList.remove('hidden');
}

function hideResult() {
  resultCard.classList.add('hidden');
}

function displayCaption(raw, elapsed) {
  const text = raw.charAt(0).toUpperCase() + raw.slice(1);
  captionText.textContent = `"${text}"`;
  captionMeta.innerHTML = `
    <span>⏱ ${elapsed}s</span>
    <span>🤖 Xenova/vit-gpt2-image-captioning</span>
    <span>⚡ Ran locally in your browser</span>
  `;
  showResultCard('output');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayError(msg) {
  errorMsg.textContent = msg;
  showResultCard('error');
}

/* ─── Loading animation ──────────────────────────────────── */
let loadingInterval = null;
function animateLoadingText() {
  let i = 0;
  loadingText.textContent = LOADING_MSGS[0];
  clearInterval(loadingInterval);
  loadingInterval = setInterval(() => {
    i = (i + 1) % LOADING_MSGS.length;
    loadingText.textContent = LOADING_MSGS[i];
  }, 2000);
}

/* ─── Copy caption ───────────────────────────────────────── */
async function copyCaption() {
  const text = captionText.textContent.replace(/^"|"$/g, '');
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    copyBtn.querySelector('span').textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.querySelector('span').textContent = 'Copy';
    }, 2000);
  } catch {
    showToast('Copy failed — select text manually.', 'warning');
  }
}

/* ─── Sample gallery ─────────────────────────────────────── */
function buildGallery() {
  SAMPLES.forEach(s => {
    const li = document.createElement('li');
    li.className = 'gallery-item';
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Load sample: ${s.label}`);

    const img = document.createElement('img');
    img.src = s.url;
    img.alt = s.label;
    img.loading = 'lazy';
    img.crossOrigin = 'anonymous';

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = s.label;

    li.appendChild(img);
    li.appendChild(overlay);

    const load = () => loadFromUrl(s.url);
    li.addEventListener('click', load);
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') load(); });
    sampleGallery.appendChild(li);
  });
}

/* ─── Toast ──────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'alert');
  const colors = { success: '#22c55e', warning: '#f59e0b', info: '#6366f1', error: '#f87171' };
  Object.assign(t.style, {
    position: 'fixed', bottom: '28px', left: '50%',
    transform: 'translateX(-50%) translateY(12px)',
    background: 'rgba(10,11,18,.92)', color: '#f1f5f9',
    border: `1px solid ${colors[type] || colors.info}`,
    borderRadius: '10px', padding: '12px 22px',
    fontSize: '.9rem', fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: '500', zIndex: '9999',
    backdropFilter: 'blur(16px)',
    transition: 'opacity .3s ease, transform .3s ease',
    opacity: '0', whiteSpace: 'nowrap',
  });
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(12px)';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

/* ─── Boot ───────────────────────────────────────────────── */
buildGallery();
attachListeners();
loadModel(); // Start downloading/loading model immediately
