// Draws the demo cast: eight flat cartoon portraits, all original, drawn in code.
// Each member has a palette, a hairstyle and one accessory so every panel reads
// as a different person at a glance. A portrait is a canvas, ready to drop into
// a poster panel or a slot thumbnail.

const MEMBERS = [
  {
    id: 'vic', name: 'VIC', role: 'THE BOSS',
    skin: '#e8b98a', hair: '#1c1410', hairStyle: 'slick',
    top: '#23232e', topTrim: '#c9a227', accessory: 'chain',
    bg: ['#ff9a3d', '#c22e6e'], sun: '#ffe9a8',
  },
  {
    id: 'marcus', name: 'MARCUS', role: 'THE DRIVER',
    skin: '#8a5a3b', hair: '#0f0c0a', hairStyle: 'cap',
    top: '#1f6f5c', topTrim: '#f2f2f2', accessory: 'shades',
    bg: ['#2ec4b6', '#114b8a'], sun: '#fdf0c0',
  },
  {
    id: 'diego', name: 'DIEGO', role: 'THE MECHANIC',
    skin: '#c98d5f', hair: '#3a2317', hairStyle: 'bandana',
    top: '#5c5c66', topTrim: '#ff6b35', accessory: 'wrench',
    bg: ['#ffcf3f', '#e4572e'], sun: '#fff3c4',
  },
  {
    id: 'carlos', name: 'CARLOS', role: 'THE CAPTAIN',
    skin: '#d9a06f', hair: '#241a12', hairStyle: 'captain',
    top: '#eef2f5', topTrim: '#173a5e', accessory: 'epaulette',
    bg: ['#7fd4ff', '#1d4e89'], sun: '#fff8d6',
  },
  {
    id: 'roxy', name: 'ROXY', role: 'THE RIDER',
    skin: '#f0c39a', hair: '#241f2e', hairStyle: 'helmet',
    top: '#2b2b33', topTrim: '#ff2e88', accessory: 'streak',
    bg: ['#ff5da2', '#6a1fb0'], sun: '#ffe3f1',
  },
  {
    id: 'nina', name: 'NINA', role: 'THE FIXER',
    skin: '#eec39a', hair: '#4a2c14', hairStyle: 'bob',
    top: '#7a1f2b', topTrim: '#e8c15a', accessory: 'earring',
    bg: ['#ffb347', '#8e2f5c'], sun: '#fff0c8',
  },
  {
    id: 'jade', name: 'JADE', role: 'THE LOOKOUT',
    skin: '#a9744f', hair: '#101010', hairStyle: 'hood',
    top: '#2e5d3a', topTrim: '#cfe8a8', accessory: 'binoculars',
    bg: ['#a8e063', '#1e6b52'], sun: '#f4ffd6',
  },
  {
    id: 'lucia', name: 'LUCIA', role: 'THE INSIDER',
    skin: '#f2c9a0', hair: '#120d0b', hairStyle: 'long',
    top: '#b3122e', topTrim: '#ffd166', accessory: 'earring',
    bg: ['#ff7e5f', '#5b2a86'], sun: '#ffe9c9',
  },
];

/** The demo cast in order, each with its id, name and role. */
export function demoCast() {
  return MEMBERS.map((m) => ({ id: m.id, name: m.name, role: m.role }));
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHair(ctx, style, spec, cx, top, hw, hh) {
  const { hair } = spec;
  ctx.fillStyle = hair;
  if (style === 'slick') {
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.12, hw * 0.52, hh * 0.34, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - hw * 0.52, top + hh * 0.12);
    ctx.quadraticCurveTo(cx - hw * 0.55, top - hh * 0.22, cx + hw * 0.1, top - hh * 0.18);
    ctx.quadraticCurveTo(cx + hw * 0.5, top - hh * 0.1, cx + hw * 0.52, top + hh * 0.12);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'cap') {
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.1, hw * 0.55, hh * 0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + hw * 0.28, top + hh * 0.16, hw * 0.42, hh * 0.1, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spec.topTrim;
    ctx.fillRect(cx - hw * 0.1, top - hh * 0.16, hw * 0.2, hh * 0.08);
  } else if (style === 'bandana') {
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.08, hw * 0.54, hh * 0.32, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = spec.topTrim;
    ctx.fillRect(cx - hw * 0.54, top - hh * 0.08, hw * 1.08, hh * 0.16);
    ctx.beginPath();
    ctx.moveTo(cx + hw * 0.5, top - hh * 0.02);
    ctx.lineTo(cx + hw * 0.72, top + hh * 0.3);
    ctx.lineTo(cx + hw * 0.38, top + hh * 0.18);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'captain') {
    ctx.fillStyle = '#f4f6f8';
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.02, hw * 0.58, hh * 0.26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#173a5e';
    ctx.fillRect(cx - hw * 0.58, top - hh * 0.1, hw * 1.16, hh * 0.1);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(cx - hw * 0.2, top - hh * 0.1, hw * 0.4, hh * 0.035);
  } else if (style === 'helmet') {
    ctx.fillStyle = '#e8e8ee';
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.05, hw * 0.56, hh * 0.36, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = spec.topTrim;
    ctx.fillRect(cx - hw * 0.56, top + hh * 0.02, hw * 1.12, hh * 0.09);
    ctx.fillStyle = 'rgba(90, 110, 160, 0.4)';
    rounded(ctx, cx - hw * 0.42, top + hh * 0.1, hw * 0.84, hh * 0.16, hh * 0.08);
    ctx.fill();
  } else if (style === 'bob') {
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.15, hw * 0.52, hh * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spec.skin;
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.32, hw * 0.44, hh * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'hood') {
    ctx.fillStyle = spec.top;
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.2, hw * 0.6, hh * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spec.skin;
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.3, hw * 0.4, hh * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'long') {
    ctx.beginPath();
    ctx.ellipse(cx, top + hh * 0.1, hw * 0.55, hh * 0.4, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - hw * 0.55, top + hh * 0.1, hw * 0.13, hh * 0.85);
    ctx.fillRect(cx + hw * 0.42, top + hh * 0.1, hw * 0.13, hh * 0.85);
  }
}

/** Accessories are anchored at eye level (`cy`), so shades sit on the eyes, a chain on the neck and tools on the chest. */
function drawAccessory(ctx, kind, spec, cx, cy, w, h) {
  if (kind === 'chain') {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = Math.max(3, w * 0.012);
    ctx.beginPath();
    ctx.arc(cx, cy + h * 0.14, w * 0.15, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (kind === 'shades') {
    ctx.fillStyle = '#101018';
    rounded(ctx, cx - w * 0.2, cy - h * 0.02, w * 0.17, h * 0.045, h * 0.02);
    ctx.fill();
    rounded(ctx, cx + w * 0.03, cy - h * 0.02, w * 0.17, h * 0.045, h * 0.02);
    ctx.fill();
    ctx.fillRect(cx - w * 0.03, cy - h * 0.005, w * 0.06, h * 0.012);
  } else if (kind === 'wrench') {
    ctx.strokeStyle = '#d8d8de';
    ctx.lineWidth = Math.max(3, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.28, cy + h * 0.3);
    ctx.lineTo(cx + w * 0.4, cy + h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + w * 0.42, cy + h * 0.16, w * 0.035, 0.6, Math.PI * 1.9);
    ctx.stroke();
  } else if (kind === 'epaulette') {
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(cx - w * 0.34, cy + h * 0.26, w * 0.14, h * 0.02);
    ctx.fillRect(cx + w * 0.2, cy + h * 0.26, w * 0.14, h * 0.02);
  } else if (kind === 'earring') {
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(cx - w * 0.21, cy + h * 0.02, w * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + w * 0.21, cy + h * 0.02, w * 0.018, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'binoculars') {
    ctx.fillStyle = '#14141c';
    rounded(ctx, cx - w * 0.2, cy - h * 0.02, w * 0.17, h * 0.05, h * 0.02);
    ctx.fill();
    rounded(ctx, cx + w * 0.03, cy - h * 0.02, w * 0.17, h * 0.05, h * 0.02);
    ctx.fill();
    ctx.strokeStyle = '#14141c';
    ctx.lineWidth = Math.max(2, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.2, cy + h * 0.03);
    ctx.lineTo(cx - w * 0.24, cy + h * 0.09);
    ctx.moveTo(cx + w * 0.2, cy + h * 0.03);
    ctx.lineTo(cx + w * 0.24, cy + h * 0.09);
    ctx.stroke();
  } else if (kind === 'streak') {
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(4, w * 0.02);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, cy - h * 0.22);
    ctx.quadraticCurveTo(cx - w * 0.28, cy + h * 0.05, cx - w * 0.2, cy + h * 0.32);
    ctx.stroke();
  }
}

/** Paints one member's portrait across the whole canvas and returns the canvas. */
export function drawPortrait(memberId, w, h) {
  const spec = MEMBERS.find((m) => m.id === memberId);
  if (!spec) return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, spec.bg[0]);
  sky.addColorStop(1, spec.bg[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = spec.sun;
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.13, w * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(0, h * (0.05 + i * 0.045), w, h * 0.012);
  }
  const cx = w / 2;
  const headY = h * 0.34;
  const headW = w * 0.21;
  const headH = h * 0.3;
  ctx.fillStyle = spec.top;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.42, h);
  ctx.quadraticCurveTo(cx - w * 0.4, h * 0.74, cx - w * 0.2, h * 0.62);
  ctx.lineTo(cx + w * 0.2, h * 0.62);
  ctx.quadraticCurveTo(cx + w * 0.4, h * 0.74, cx + w * 0.42, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = spec.topTrim;
  ctx.fillRect(cx - w * 0.06, h * 0.62, w * 0.12, h * 0.38);
  ctx.fillStyle = spec.skin;
  ctx.fillRect(cx - w * 0.07, h * 0.52, w * 0.14, h * 0.12);
  ctx.beginPath();
  ctx.ellipse(cx, headY + headH * 0.28, headW, headH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - headW * 0.98, headY + headH * 0.3, headW * 0.12, headH * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headW * 0.98, headY + headH * 0.3, headW * 0.12, headH * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  drawHair(ctx, spec.hairStyle, spec, cx, headY - headH * 0.28, headW, headH);
  ctx.fillStyle = '#1a1210';
  ctx.beginPath();
  ctx.arc(cx - headW * 0.36, headY + headH * 0.3, headW * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + headW * 0.36, headY + headH * 0.3, headW * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 50, 30, 0.7)';
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath();
  ctx.moveTo(cx - headW * 0.14, headY + headH * 0.62);
  ctx.quadraticCurveTo(cx, headY + headH * 0.72, cx + headW * 0.14, headY + headH * 0.62);
  ctx.stroke();
  drawAccessory(ctx, spec.accessory, spec, cx, headY + headH * 0.3, w, h);
  return canvas;
}
