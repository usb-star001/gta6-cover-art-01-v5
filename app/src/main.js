// Wires the studio: eight cast slots, the caption panel, layouts and grades,
// the live preview, undo/redo, and the PNG exports. Portraits live in a Map
// keyed by slot id; rendering never mutates state, it only reads a render-only
// copy that resolves each slot's image from the Map. A `?shot=` query sets up
// a fixed scene for a screenshot instead (./shots.js).

import { renderPoster, gradeNames, panelAt } from './poster.js';
import { demoCast, drawPortrait } from './portraits.js';
import { runShot } from './shots.js';

const CAPTION_DEFAULTS = {
  title: 'NEON VERDICT',
  subtitle: 'Every Sunset Has a Price',
  ribbon: 'EIGHT CREW · ONE COAST · NO WAY BACK',
  quote: 'PURE ADRENALINE IN EVERY FRAME',
  quoteSource: 'THE LEONIDA LEDGER',
  billing: 'A LEONIDA NIGHTS PICTURE · STARRING YOU AND YOUR CREW',
  release: 'COMING SOON',
  edition: 'VOL. 1',
  seal: 'BEST CAST',
};

const EXPORT_SIZES = {
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
  '16:9': [1920, 1080],
};

const PREVIEW_SIZES = {
  '1:1': [540, 540],
  '4:5': [540, 675],
  '16:9': [720, 405],
};

const CAST = demoCast();
const canvas = document.getElementById('poster');
const statusEl = document.getElementById('status');
const slotGrid = document.getElementById('slots');
const fileInput = document.getElementById('file-input');

/** Portraits by slot id: an uploaded image or a drawn demo portrait. */
const images = new Map();
let state = freshState();
let past = [];
let future = [];
let selected = 0;
let uploadSlot = 0;

function freshState() {
  return {
    slots: CAST.map((m) => ({
      id: m.id, name: m.name, role: m.role, imgId: null, panX: 0, panY: 0, zoom: 1, flip: false,
    })),
    caption: { ...CAPTION_DEFAULTS },
    layout: 'mosaic',
    grade: 'sunset',
    ratio: '4:5',
  };
}

/**
 * Builds the render-only view the poster renderer reads: each slot's image is
 * resolved from the portraits Map into a copy, so rendering never writes to
 * state and undo/redo history snapshots stay safe.
 */
function renderState() {
  return {
    slots: state.slots.map((slot) => ({
      ...slot,
      img: slot.imgId ? images.get(slot.imgId) || null : null,
    })),
    ...state.caption,
    layout: state.layout,
    grade: state.grade,
    ratio: state.ratio,
  };
}

function snapshot() {
  return JSON.stringify(state);
}

function pushHistory() {
  past.push(snapshot());
  if (past.length > 60) past.shift();
  future = [];
  refreshHistoryButtons();
}

function restore(data) {
  state = JSON.parse(data);
  selected = Math.min(selected, state.slots.length - 1);
  syncControls();
  redraw();
}

function undo() {
  if (!past.length) return;
  future.push(snapshot());
  restore(past.pop());
  refreshHistoryButtons();
}

function redo() {
  if (!future.length) return;
  past.push(snapshot());
  restore(future.pop());
  refreshHistoryButtons();
}

function refreshHistoryButtons() {
  document.getElementById('undo').disabled = past.length === 0;
  document.getElementById('redo').disabled = future.length === 0;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function redraw() {
  const coverMode = document.body.classList.contains('shot-cover');
  if (coverMode) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    const [w, h] = PREVIEW_SIZES[state.ratio];
    canvas.width = w;
    canvas.height = h;
  }
  renderPoster(canvas, renderState());
  drawSlotThumbs();
}

function drawSlotThumbs() {
  const cards = slotGrid.querySelectorAll('.slot');
  cards.forEach((card, i) => {
    const thumb = card.querySelector('canvas');
    const tctx = thumb.getContext('2d');
    const slot = state.slots[i];
    tctx.clearRect(0, 0, thumb.width, thumb.height);
    const img = slot.imgId ? images.get(slot.imgId) : null;
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const s = Math.max(thumb.width / iw, thumb.height / ih);
      tctx.drawImage(img, (thumb.width - iw * s) / 2, (thumb.height - ih * s) / 2, iw * s, ih * s);
    } else {
      tctx.fillStyle = '#33333f';
      tctx.fillRect(0, 0, thumb.width, thumb.height);
      tctx.fillStyle = '#9a97a8';
      tctx.font = '700 11px system-ui, sans-serif';
      tctx.textAlign = 'center';
      tctx.fillText('EMPTY', thumb.width / 2, thumb.height / 2 + 4);
    }
    card.classList.toggle('selected', i === selected);
    card.querySelector('.slot-name').textContent = slot.name;
    card.querySelector('.slot-role').textContent = slot.role;
  });
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('could not read image')); };
    img.src = url;
  });
}

async function setSlotPhoto(index, file) {
  try {
    const img = await loadImageFile(file);
    const key = `upload-${index}-${file.name}`;
    images.set(key, img);
    pushHistory();
    state.slots[index].imgId = key;
    state.slots[index].panX = 0;
    state.slots[index].panY = 0;
    state.slots[index].zoom = 1;
    state.slots[index].flip = false;
    selected = index;
    redraw();
    setStatus(`${state.slots[index].name} photo loaded.`);
  } catch {
    setStatus('That file could not be read as an image.');
  }
}

function loadSamples() {
  CAST.forEach((member) => {
    const art = drawPortrait(member.id, 600, 500);
    if (art) images.set(member.id, art);
  });
  state.slots.forEach((slot) => {
    slot.imgId = slot.id;
    slot.panX = 0;
    slot.panY = 0;
    slot.zoom = 1;
    slot.flip = false;
  });
}

function trySamples() {
  pushHistory();
  loadSamples();
  redraw();
  setStatus('Demo cast loaded: eight original portraits.');
}

function clearSlot(index) {
  pushHistory();
  state.slots[index].imgId = null;
  state.slots[index].panX = 0;
  state.slots[index].panY = 0;
  state.slots[index].zoom = 1;
  state.slots[index].flip = false;
  redraw();
  setStatus(`${state.slots[index].name} cleared.`);
}

function swapSlots(a, b) {
  if (a === b) return;
  pushHistory();
  const left = state.slots[a];
  const right = state.slots[b];
  const keys = ['imgId', 'panX', 'panY', 'zoom', 'flip'];
  keys.forEach((k) => {
    const tmp = left[k];
    left[k] = right[k];
    right[k] = tmp;
  });
  redraw();
}

function buildSlotCards() {
  CAST.forEach((member, i) => {
    const card = document.createElement('article');
    card.className = 'slot';
    card.innerHTML = `
      <canvas width="96" height="120"></canvas>
      <div class="slot-meta"><strong class="slot-name">${member.name}</strong><span class="slot-role">${member.role}</span></div>
      <div class="slot-actions">
        <button type="button" class="mini upload-btn">Upload</button>
        <button type="button" class="mini clear-btn">Clear</button>
      </div>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      selected = i;
      syncPanelControls();
      redraw();
    });
    card.querySelector('.upload-btn').addEventListener('click', () => {
      uploadSlot = i;
      fileInput.click();
    });
    card.querySelector('.clear-btn').addEventListener('click', () => clearSlot(i));
    card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('drop'); });
    card.addEventListener('dragleave', () => card.classList.remove('drop'));
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drop');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) setSlotPhoto(i, file);
    });
    slotGrid.appendChild(card);
  });
}

function buildPickers() {
  const layoutBox = document.getElementById('layouts');
  [['mosaic', 'Cast Mosaic'], ['strips', 'Diagonal Strips'], ['grid', 'Six Grid'], ['stack', 'Vertical Stack']]
    .forEach(([value, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pick';
      b.dataset.value = value;
      b.textContent = label;
      b.addEventListener('click', () => {
        pushHistory();
        state.layout = value;
        syncControls();
        redraw();
      });
      layoutBox.appendChild(b);
    });
  const gradeBox = document.getElementById('grades');
  gradeNames().forEach(([value, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.dataset.value = value;
    b.textContent = label;
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = value;
      syncControls();
      redraw();
    });
    gradeBox.appendChild(b);
  });
  const ratioBox = document.getElementById('ratios');
  Object.keys(EXPORT_SIZES).forEach((value) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.dataset.value = value;
    b.textContent = value;
    b.addEventListener('click', () => {
      pushHistory();
      state.ratio = value;
      syncControls();
      redraw();
    });
    ratioBox.appendChild(b);
  });
}

function syncControls() {
  document.querySelectorAll('#layouts .pick').forEach((b) => b.classList.toggle('on', b.dataset.value === state.layout));
  document.querySelectorAll('#grades .pick').forEach((b) => b.classList.toggle('on', b.dataset.value === state.grade));
  document.querySelectorAll('#ratios .pick').forEach((b) => b.classList.toggle('on', b.dataset.value === state.ratio));
  document.querySelectorAll('[data-caption]').forEach((input) => {
    input.value = state.caption[input.dataset.caption];
  });
  syncPanelControls();
}

function syncPanelControls() {
  const slot = state.slots[selected];
  document.getElementById('panel-label').textContent = `${slot.name} — ${slot.role}`;
  document.getElementById('zoom').value = slot.zoom;
  document.getElementById('pan-x').value = slot.panX;
  document.getElementById('pan-y').value = slot.panY;
  document.getElementById('flip').classList.toggle('on', slot.flip);
  document.getElementById('zoom-val').textContent = `${Math.round(slot.zoom * 100)}%`;
}

function bindControls() {
  document.querySelectorAll('[data-caption]').forEach((input) => {
    input.addEventListener('input', () => {
      state.caption[input.dataset.caption] = input.value;
      redraw();
    });
    input.addEventListener('change', () => pushHistory());
  });
  document.getElementById('try-samples').addEventListener('click', trySamples);
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);
  document.getElementById('export-all').addEventListener('click', exportAll);
  document.getElementById('export-one').addEventListener('click', () => exportOne(state.ratio));
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.slots[selected].zoom = Number(e.target.value);
    syncPanelControls();
    redraw();
  });
  document.getElementById('zoom').addEventListener('change', () => pushHistory());
  document.getElementById('pan-x').addEventListener('input', (e) => {
    state.slots[selected].panX = Number(e.target.value);
    redraw();
  });
  document.getElementById('pan-x').addEventListener('change', () => pushHistory());
  document.getElementById('pan-y').addEventListener('input', (e) => {
    state.slots[selected].panY = Number(e.target.value);
    redraw();
  });
  document.getElementById('pan-y').addEventListener('change', () => pushHistory());
  document.getElementById('flip').addEventListener('click', () => {
    pushHistory();
    state.slots[selected].flip = !state.slots[selected].flip;
    syncPanelControls();
    redraw();
  });
  document.getElementById('swap-left').addEventListener('click', () => {
    if (selected > 0) { swapSlots(selected, selected - 1); selected -= 1; syncPanelControls(); }
  });
  document.getElementById('swap-right').addEventListener('click', () => {
    if (selected < state.slots.length - 1) { swapSlots(selected, selected + 1); selected += 1; syncPanelControls(); }
  });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (file) setSlotPhoto(uploadSlot, file);
  });
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData ? e.clipboardData.items : [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const empty = state.slots.findIndex((s) => !s.imgId);
          setSlotPhoto(empty === -1 ? selected : empty, file);
        }
        e.preventDefault();
        return;
      }
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const hit = panelAt(state.layout, x, y, canvas.width, canvas.height);
    if (hit >= 0) {
      selected = hit;
      syncPanelControls();
      redraw();
    }
  });
}

function renderExport(ratio) {
  const [w, h] = EXPORT_SIZES[ratio];
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  renderPoster(out, renderState());
  return out;
}

function saveCanvas(out, filename) {
  out.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

async function exportOne(ratio) {
  const out = renderExport(ratio);
  saveCanvas(out, `leonida-nights-${ratio.replace(':', 'x')}.png`);
  setStatus(`Exported leonida-nights-${ratio.replace(':', 'x')}.png (${EXPORT_SIZES[ratio][0]} x ${EXPORT_SIZES[ratio][1]}).`);
}

async function exportAll() {
  Object.keys(EXPORT_SIZES).forEach((ratio) => {
    const out = renderExport(ratio);
    saveCanvas(out, `leonida-nights-${ratio.replace(':', 'x')}.png`);
  });
  setStatus('Exported all three PNGs: 1080 x 1080, 1080 x 1350, 1920 x 1080.');
}

buildSlotCards();
buildPickers();
bindControls();
syncControls();
refreshHistoryButtons();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (query) => {
    const ratio = query.get('ratio');
    if (ratio === '1:1' || ratio === '4:5' || ratio === '16:9') state.ratio = ratio;
    loadSamples();
    syncControls();
    redraw();
  });
} else {
  redraw();
}
