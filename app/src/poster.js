// Renders the poster onto a canvas, from a render-only view of the app state.
// Every position is a fraction of the canvas size, so the same drawing works for
// the live preview and for the 1080 x 1080, 1080 x 1350 and 1920 x 1080 exports.
// Nothing here touches app state: it only reads the view it is handed.

const GRADES = {
  sunset: {
    bg: ['#2b0f3f', '#ff7a18'], title: ['#ffe259', '#ff7e00'],
    accent: '#ff2e88', ribbon: '#1b1b22', ribbonText: '#ffe9a8',
    label: 'rgba(10, 10, 20, 0.82)', sun: '#ffd94d', footer: '#ffe9a8',
  },
  neon: {
    bg: ['#0b0620', '#123a8f'], title: ['#7df9ff', '#ff2e88'],
    accent: '#00e5ff', ribbon: '#0b0620', ribbonText: '#7df9ff',
    label: 'rgba(5, 5, 20, 0.85)', sun: '#ff5da2', footer: '#cfe9ff',
  },
  tropic: {
    bg: ['#003b46', '#00b4a2'], title: ['#d6ff5e', '#00c2a8'],
    accent: '#ffcf3f', ribbon: '#003b46', ribbonText: '#d6ff5e',
    label: 'rgba(0, 30, 35, 0.85)', sun: '#ffe9a8', footer: '#d6ff5e',
  },
  ultraviolet: {
    bg: ['#1d004d', '#7b2ff7'], title: ['#e0aaff', '#5a189a'],
    accent: '#c77dff', ribbon: '#16002b', ribbonText: '#e0aaff',
    label: 'rgba(20, 0, 45, 0.85)', sun: '#ffb3ff', footer: '#e0aaff',
  },
  retro: {
    bg: ['#f4e3c1', '#e2725b'], title: ['#3d405b', '#e07a5f'],
    accent: '#81b29a', ribbon: '#3d405b', ribbonText: '#f4e3c1',
    label: 'rgba(40, 30, 20, 0.85)', sun: '#f2cc8f', footer: '#3d405b',
  },
};

/** The grade names, in the order the editor lists them. */
export function gradeNames() {
  return [
    ['sunset', 'Sunset Gold'],
    ['neon', 'Neon Night'],
    ['tropic', 'Tropic Teal'],
    ['ultraviolet', 'Ultraviolet'],
    ['retro', 'Retro Print'],
  ];
}

function fitFont(ctx, text, maxWidth, startSize, family, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function coverDraw(ctx, img, x, y, w, h, zoom, panX, panY, flip) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const base = Math.max(w / iw, h / ih) * (zoom || 1);
  const dw = iw * base;
  const dh = ih * base;
  const ox = x + (w - dw) / 2 + (panX || 0) * w * 0.25;
  const oy = y + (h - dh) / 2 + (panY || 0) * h * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (flip) {
    const cx2 = x + w / 2;
    ctx.translate(2 * cx2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 2 * cx2 - ox - dw, oy, dw, dh);
  } else {
    ctx.drawImage(img, ox, oy, dw, dh);
  }
  ctx.restore();
}

function drawPanel(ctx, rect, slot, grade) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (slot && slot.img) {
    coverDraw(ctx, slot.img, x, y, w, h, slot.zoom, slot.panX, slot.panY, slot.flip);
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#3a3a4a');
    g.addColorStop(1, '#191922');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.max(2, h * 0.02);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.38, h * 0.14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2 + h * 0.06, y + h * 0.34, h * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = `700 ${Math.max(10, h * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD PHOTO', x + w / 2, y + h * 0.72);
  }
  const labelH = Math.max(14, h * 0.2);
  ctx.fillStyle = grade.label;
  ctx.fillRect(x, y + h - labelH, w, labelH);
  if (slot && slot.role) {
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitFont(ctx, slot.role, w * 0.94, labelH * 0.52, 'system-ui, sans-serif', '800');
    ctx.fillText(slot.role, x + w / 2, y + h - labelH / 2);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawTitle(ctx, text, cx, baselineY, maxWidth, maxSize, grade, W, H) {
  const family = 'system-ui, sans-serif';
  const pad = Math.max(8, maxSize * 0.12);
  const off = document.createElement('canvas');
  off.width = Math.ceil(maxWidth + pad * 2);
  off.height = Math.ceil(maxSize * 1.5);
  const o = off.getContext('2d');
  let size = maxSize;
  o.font = `900 ${size}px ${family}`;
  while (size > 12 && o.measureText(text).width > maxWidth) {
    size -= 2;
    o.font = `900 ${size}px ${family}`;
  }
  const tw = o.measureText(text).width;
  const tx = (off.width - tw) / 2;
  const ty = off.height * 0.72;
  const step = Math.max(2, size * 0.045);
  o.textAlign = 'left';
  o.textBaseline = 'alphabetic';
  for (let i = 4; i >= 1; i -= 1) {
    o.fillStyle = i % 2 ? '#3a0a2e' : '#12061c';
    o.fillText(text, tx + step * i, ty + step * i);
  }
  const grad = o.createLinearGradient(0, ty - size, 0, ty);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(1, grade.title[1]);
  o.fillStyle = grad;
  o.fillText(text, tx, ty);
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = 'rgba(255, 255, 255, 0.28)';
  const stripe = Math.max(3, size * 0.045);
  for (let sx = -off.height; sx < off.width + off.height; sx += stripe * 3) {
    o.beginPath();
    o.moveTo(sx, 0);
    o.lineTo(sx + stripe, 0);
    o.lineTo(sx + stripe - off.height * 0.5, off.height);
    o.lineTo(sx - off.height * 0.5, off.height);
    o.closePath();
    o.fill();
  }
  o.globalCompositeOperation = 'source-over';
  ctx.drawImage(off, cx - off.width / 2, baselineY - off.height * 0.72);
  return size;
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = '#111111';
  let bx = x;
  let i = 0;
  while (bx < x + w) {
    const bw = 1 + ((i * 7 + 3) % 4);
    if (i % 3 !== 2) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + (i % 2);
    i += 1;
  }
}

function drawFooter(ctx, view, W, H, grade) {
  ctx.fillStyle = grade.footer;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const billing = view.billing || '';
  fitFont(ctx, billing, W * 0.62, H * 0.021, 'system-ui, sans-serif', '700');
  ctx.fillText(billing, W / 2, H * 0.855);
  const release = view.release || '';
  fitFont(ctx, release, W * 0.3, H * 0.024, 'system-ui, sans-serif', '900');
  ctx.fillStyle = '#ffffff';
  ctx.fillText(release, W / 2, H * 0.945);
  drawBarcode(ctx, W * 0.03, H * 0.885, W * 0.13, H * 0.05);
  const r = Math.min(W, H) * 0.042;
  const sx = W * 0.93;
  const sy = H * 0.91;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#c9a227';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.strokeStyle = '#8a6d1b';
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#241a05';
  ctx.font = `900 ${Math.max(8, r * 0.34)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const seal = view.seal || 'BEST CAST';
  const words = seal.split(' ');
  if (words.length > 1) {
    ctx.fillText(words[0], sx, sy - r * 0.2);
    ctx.fillText(words.slice(1).join(' '), sx, sy + r * 0.24);
  } else {
    ctx.fillText(seal, sx, sy);
  }
  ctx.restore();
}

function drawTopBar(ctx, view, W, H) {
  const stars = '\u2605\u2605\u2605\u2605\u2605';
  const line = `${stars}  ${view.quote || ''} \u2014 ${view.quoteSource || ''}   ${view.edition || ''}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, line, W * 0.94, H * 0.024, 'system-ui, sans-serif', '700');
  ctx.fillText(line, W / 2, H * 0.045);
}

function drawMosaic(ctx, view, W, H, grade) {
  const gap = W * 0.012;
  const topY = H * 0.09;
  const topH = H * 0.26;
  const botY = H * 0.62;
  const botH = H * 0.18;
  const pw = (W - gap * 5) / 4;
  for (let i = 0; i < 4; i += 1) {
    drawPanel(ctx, { x: gap * (i + 1) + pw * i, y: topY, w: pw, h: topH }, view.slots[i], grade);
  }
  for (let i = 0; i < 4; i += 1) {
    drawPanel(ctx, { x: gap * (i + 1) + pw * i, y: botY, w: pw, h: botH }, view.slots[4 + i], grade);
  }
  const sunR = H * 0.085;
  const sun = ctx.createRadialGradient(W / 2, H * 0.47, sunR * 0.1, W / 2, H * 0.47, sunR);
  sun.addColorStop(0, grade.sun);
  sun.addColorStop(1, 'rgba(255, 120, 60, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.47, sunR, 0, Math.PI * 2);
  ctx.fill();
  drawTitle(ctx, view.title || '', W / 2, H * 0.51, W * 0.92, H * 0.115, grade, W, H);
  ctx.fillStyle = grade.footer;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, view.subtitle || '', W * 0.8, H * 0.028, 'Georgia, serif', 'italic 700');
  ctx.font = `italic 700 ${Math.max(10, H * 0.028)}px Georgia, serif`;
  ctx.fillText(view.subtitle || '', W / 2, H * 0.565);
  const ribbonY = H * 0.578;
  const ribbonH = H * 0.036;
  ctx.fillStyle = grade.ribbon;
  ctx.fillRect(0, ribbonY, W, ribbonH);
  ctx.fillStyle = grade.ribbonText;
  fitFont(ctx, view.ribbon || '', W * 0.9, H * 0.022, 'system-ui, sans-serif', '800');
  ctx.textBaseline = 'middle';
  ctx.fillText(view.ribbon || '', W / 2, ribbonY + ribbonH / 2);
  ctx.textBaseline = 'alphabetic';
}

function drawStrips(ctx, view, W, H, grade) {
  const slant = W * 0.07;
  const top = H * 0.1;
  const bandH = (H * 0.7) / 8;
  for (let i = 0; i < 8; i += 1) {
    const y = top + i * bandH;
    const x0 = -slant + (i % 2 ? slant * 0.4 : 0);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + W + slant * 2, y);
    ctx.lineTo(x0 + W + slant * 2 - slant, y + bandH);
    ctx.lineTo(x0 - slant, y + bandH);
    ctx.closePath();
    ctx.clip();
    const slot = view.slots[i];
    if (slot && slot.img) {
      coverDraw(ctx, slot.img, x0 - slant, y, W + slant * 3, bandH, slot.zoom, slot.panX, slot.panY, slot.flip);
    } else {
      ctx.fillStyle = i % 2 ? '#2c2c3a' : '#1c1c26';
      ctx.fillRect(x0 - slant, y, W + slant * 3, bandH);
    }
    ctx.restore();
    ctx.fillStyle = grade.label;
    ctx.fillRect(x0 + W * 0.03, y + bandH - Math.max(12, bandH * 0.26), W * 0.16, Math.max(12, bandH * 0.26));
    if (slot && slot.role) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.max(9, bandH * 0.14)}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(slot.role, x0 + W * 0.04, y + bandH - Math.max(12, bandH * 0.26) / 2);
    }
  }
  ctx.fillStyle = 'rgba(10, 6, 20, 0.78)';
  ctx.fillRect(0, H * 0.4, W, H * 0.2);
  drawTitle(ctx, view.title || '', W / 2, H * 0.5, W * 0.9, H * 0.1, grade, W, H);
  ctx.fillStyle = grade.footer;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, view.subtitle || '', W * 0.8, H * 0.026, 'Georgia, serif', 'italic 700');
  ctx.font = `italic 700 ${Math.max(10, H * 0.026)}px Georgia, serif`;
  ctx.fillText(view.subtitle || '', W / 2, H * 0.575);
}

function drawGrid(ctx, view, W, H, grade) {
  const gap = W * 0.014;
  const cols = 3;
  const rows = 2;
  const gridW = W * 0.92;
  const gridX = (W - gridW) / 2;
  const cellW = (gridW - gap * (cols - 1)) / cols;
  const gridY = H * 0.2;
  const cellH = (H * 0.46) / rows;
  drawTitle(ctx, view.title || '', W / 2, H * 0.14, W * 0.9, H * 0.09, grade, W, H);
  for (let i = 0; i < 6; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    drawPanel(ctx, {
      x: gridX + c * (cellW + gap), y: gridY + r * (cellH + gap), w: cellW, h: cellH,
    }, view.slots[i], grade);
  }
  ctx.fillStyle = grade.footer;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, view.subtitle || '', W * 0.8, H * 0.026, 'Georgia, serif', 'italic 700');
  ctx.font = `italic 700 ${Math.max(10, H * 0.026)}px Georgia, serif`;
  ctx.fillText(view.subtitle || '', W / 2, H * 0.72);
  ctx.fillStyle = grade.ribbon;
  ctx.fillRect(0, H * 0.74, W, H * 0.036);
  ctx.fillStyle = grade.ribbonText;
  fitFont(ctx, view.ribbon || '', W * 0.9, H * 0.022, 'system-ui, sans-serif', '800');
  ctx.textBaseline = 'middle';
  ctx.fillText(view.ribbon || '', W / 2, H * 0.74 + H * 0.018);
  ctx.textBaseline = 'alphabetic';
}

function drawStack(ctx, view, W, H, grade) {
  const gap = W * 0.014;
  const cols = 2;
  const rows = 4;
  const stackW = W * 0.94;
  const stackX = (W - stackW) / 2;
  const cellW = (stackW - gap) / cols;
  const stackY = H * 0.16;
  const cellH = (H * 0.62) / rows;
  drawTitle(ctx, view.title || '', W / 2, H * 0.11, W * 0.9, H * 0.08, grade, W, H);
  for (let i = 0; i < 8; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    drawPanel(ctx, {
      x: stackX + c * (cellW + gap), y: stackY + r * (cellH + gap), w: cellW, h: cellH,
    }, view.slots[i], grade);
  }
  ctx.fillStyle = grade.ribbon;
  ctx.fillRect(0, H * 0.8, W, H * 0.036);
  ctx.fillStyle = grade.ribbonText;
  ctx.textAlign = 'center';
  fitFont(ctx, view.ribbon || '', W * 0.9, H * 0.022, 'system-ui, sans-serif', '800');
  ctx.textBaseline = 'middle';
  ctx.fillText(view.ribbon || '', W / 2, H * 0.8 + H * 0.018);
  ctx.textBaseline = 'alphabetic';
}

/** Which slot index sits at canvas point (x, y) for a layout, or -1. */
export function panelAt(layout, x, y, W, H) {
  const gap = W * 0.012;
  if (layout === 'strips') {
    const top = H * 0.1;
    const bandH = (H * 0.7) / 8;
    if (y < top || y >= top + bandH * 8) return -1;
    return Math.min(7, Math.floor((y - top) / bandH));
  }
  if (layout === 'grid') {
    const cols = 3;
    const gridW = W * 0.92;
    const gridX = (W - gridW) / 2;
    const cellW = (gridW - gap * 2) / cols;
    const gridY = H * 0.2;
    const cellH = (H * 0.46) / 2;
    if (x < gridX || x >= gridX + gridW || y < gridY || y >= gridY + cellH * 2 + gap) return -1;
    const c = Math.min(cols - 1, Math.floor((x - gridX) / (cellW + gap)));
    const r = Math.min(1, Math.floor((y - gridY) / (cellH + gap)));
    return r * cols + c;
  }
  if (layout === 'stack') {
    const stackW = W * 0.94;
    const stackX = (W - stackW) / 2;
    const cellW = (stackW - gap) / 2;
    const stackY = H * 0.16;
    const cellH = (H * 0.62) / 4;
    if (x < stackX || x >= stackX + stackW || y < stackY || y >= stackY + cellH * 4 + gap * 3) return -1;
    const c = Math.min(1, Math.floor((x - stackX) / (cellW + gap)));
    const r = Math.min(3, Math.floor((y - stackY) / (cellH + gap)));
    return r * 2 + c;
  }
  const pw = (W - gap * 5) / 4;
  if (y >= H * 0.09 && y < H * 0.35) return Math.min(3, Math.floor(x / (pw + gap)));
  if (y >= H * 0.62 && y < H * 0.8) return 4 + Math.min(3, Math.floor(x / (pw + gap)));
  return -1;
}

/** Paints the whole poster onto `canvas` from a render-only `view`. */
export function renderPoster(canvas, view) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[view.grade] || GRADES.sunset;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grade.bg[0]);
  bg.addColorStop(1, grade.bg[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(0, H * (0.12 + i * 0.17), W, H * 0.006);
  }
  drawTopBar(ctx, view, W, H);
  if (view.layout === 'strips') drawStrips(ctx, view, W, H, grade);
  else if (view.layout === 'grid') drawGrid(ctx, view, W, H, grade);
  else if (view.layout === 'stack') drawStack(ctx, view, W, H, grade);
  else drawMosaic(ctx, view, W, H, grade);
  drawFooter(ctx, view, W, H, grade);
}
