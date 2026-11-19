// cover.js — draws the multi-panel cover for Vice City Cover Maker.
// Everything here is drawn by hand on a 2D canvas: gradients, a sun,
// skyline and palm silhouettes, panel gutters and the big caption.
// No external art, logos or fonts are used anywhere.

export const LAYOUTS = {
  nine: { label: 'Nine Panel', hint: '3 x 3 grid, big centre' },
  hero: { label: 'Hero Left', hint: 'One tall hero panel, three stacked' },
  strip: { label: 'Sunset Strip', hint: 'Wide hero on top, three below' },
};

export const GRADES = {
  sunset: { label: 'Sunset', hint: 'Orange, pink and purple dusk' },
  neon: { label: 'Neon', hint: 'Cyan and magenta night glow' },
  noir: { label: 'Noir', hint: 'High contrast black and white' },
};

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Landscape 1920 x 1080' },
};

// Panels are given as fractions of the cover area (x, y, w, h).
// The caption band sits at the bottom; panels live above it.
export function layoutPanels(layout, captionH = 0.16) {
  const top = 1 - captionH;
  if (layout === 'hero') {
    return [
      { x: 0, y: 0, w: 0.56, h: top },
      { x: 0.56, y: 0, w: 0.44, h: top / 3 },
      { x: 0.56, y: top / 3, w: 0.44, h: top / 3 },
      { x: 0.56, y: (2 * top) / 3, w: 0.44, h: top / 3 },
    ];
  }
  if (layout === 'strip') {
    return [
      { x: 0, y: 0, w: 1, h: top * 0.58 },
      { x: 0, y: top * 0.58, w: 1 / 3, h: top * 0.42 },
      { x: 1 / 3, y: top * 0.58, w: 1 / 3, h: top * 0.42 },
      { x: 2 / 3, y: top * 0.58, w: 1 / 3, h: top * 0.42 },
    ];
  }
  // nine: 3 x 3 with a larger centre cell.
  const cols = [0, 0.31, 0.69, 1];
  const rows = [0, 0.31 * top, 0.69 * top, top];
  const panels = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      panels.push({ x: cols[c], y: rows[r], w: cols[c + 1] - cols[c], h: rows[r + 1] - rows[r] });
    }
  }
  return panels;
}

// Small deterministic pseudo-random helper so the skyline is stable per panel.
function seeded(n) {
  let s = (n + 1) * 2654435761;
  return () => {
    s = (s ^ (s >>> 15)) * 2246822519;
    s = (s ^ (s >>> 13)) * 3266489917;
    s ^= s >>> 16;
    return ((s >>> 0) % 1000) / 1000;
  };
}

function skyColors(grade) {
  if (grade === 'neon') return ['#12082e', '#3b0f5e', '#ff2e88', '#00e5ff'];
  if (grade === 'noir') return ['#e8e8e8', '#9a9a9a', '#3a3a3a', '#0a0a0a'];
  return ['#2b1055', '#7597de', '#ff7e5f', '#feb47b'];
}

function drawSun(ctx, cx, cy, r, grade) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
  if (grade === 'neon') {
    glow.addColorStop(0, 'rgba(255,46,136,0.85)');
    glow.addColorStop(1, 'rgba(255,46,136,0)');
  } else if (grade === 'noir') {
    glow.addColorStop(0, 'rgba(255,255,255,0.7)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
  } else {
    glow.addColorStop(0, 'rgba(255,190,90,0.9)');
    glow.addColorStop(1, 'rgba(255,110,90,0)');
  }
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
  const disc = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  if (grade === 'neon') {
    disc.addColorStop(0, '#ffe95e');
    disc.addColorStop(0.55, '#ff2e88');
    disc.addColorStop(1, '#7b2eff');
  } else if (grade === 'noir') {
    disc.addColorStop(0, '#ffffff');
    disc.addColorStop(1, '#777777');
  } else {
    disc.addColorStop(0, '#ffe98a');
    disc.addColorStop(0.5, '#ff9e56');
    disc.addColorStop(1, '#ff5e7a');
  }
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Retro slats across the lower half of the sun.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grade === 'noir' ? '#0a0a0a' : '#1a0b2e';
  for (let i = 0; i < 4; i++) {
    const y = cy + r * (0.05 + i * 0.22);
    ctx.fillRect(cx - r, y, r * 2, r * (0.03 + i * 0.02));
  }
  ctx.restore();
}

function drawSkyline(ctx, x, y, w, h, grade, seed) {
  const rnd = seeded(seed);
  const base = y + h;
  ctx.fillStyle = grade === 'noir' ? '#111111' : grade === 'neon' ? '#0d0221' : '#241040';
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.08 + rnd() * 0.12);
    const bh = h * (0.3 + rnd() * 0.55);
    ctx.fillRect(bx, base - bh, bw, bh);
    // Antenna on some towers.
    if (rnd() > 0.6) {
      ctx.fillRect(bx + bw / 2 - 1, base - bh - h * 0.12, 2, h * 0.12);
      ctx.fillStyle = grade === 'neon' ? '#ff2e88' : '#ffd166';
      ctx.beginPath();
      ctx.arc(bx + bw / 2, base - bh - h * 0.12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = grade === 'noir' ? '#111111' : grade === 'neon' ? '#0d0221' : '#241040';
    }
    // Lit windows.
    ctx.fillStyle = grade === 'neon' ? 'rgba(0,229,255,0.85)' : grade === 'noir' ? 'rgba(255,255,255,0.5)' : 'rgba(255,209,102,0.85)';
    for (let wy = base - bh + 6; wy < base - 6; wy += 12) {
      for (let wx = bx + 5; wx < bx + bw - 5; wx += 11) {
        if (rnd() > 0.55) ctx.fillRect(wx, wy, 4, 6);
      }
    }
    ctx.fillStyle = grade === 'noir' ? '#111111' : grade === 'neon' ? '#0d0221' : '#241040';
    bx += bw + 2;
  }
}

function drawPalm(ctx, x, y, s, lean, grade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = grade === 'noir' ? '#000000' : '#160a2e';
  ctx.fillStyle = grade === 'noir' ? '#000000' : '#160a2e';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Trunk, curving gently.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -60, -6, -110);
  ctx.stroke();
  // Fronds fanning from the crown.
  ctx.translate(-6, -110);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i * 0.14));
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(34, -16, 66, 6);
    ctx.quadraticCurveTo(34, 4, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(-6, 4, 5, 0, Math.PI * 2);
  ctx.arc(5, 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBirds(ctx, x, y, w, grade) {
  ctx.strokeStyle = grade === 'noir' ? '#222222' : '#1c0b33';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const spots = [[0.2, 0.25], [0.45, 0.15], [0.68, 0.3]];
  for (const [fx, fy] of spots) {
    const bx = x + w * fx;
    const by = y + fy * 90;
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.quadraticCurveTo(bx - 3, by - 7, bx, by);
    ctx.quadraticCurveTo(bx + 3, by - 7, bx + 9, by);
    ctx.stroke();
  }
}

// A fully drawn panel, used when a panel has no photo (or as a base
// under a faded photo). variant cycles the scene per panel index.
export function drawArtPanel(ctx, rect, variant, grade) {
  const { x, y, w, h } = rect;
  const sky = skyColors(grade);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, sky[0]);
  g.addColorStop(0.45, sky[1]);
  g.addColorStop(0.75, sky[2]);
  g.addColorStop(1, sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  const v = variant % 4;
  if (v === 0 || v === 3) {
    drawSun(ctx, x + w * (v === 0 ? 0.5 : 0.68), y + h * 0.42, Math.min(w, h) * 0.26, grade);
    drawBirds(ctx, x, y, w, grade);
  }
  if (v === 1 || v === 3) {
    // Water band with a shimmering reflection.
    ctx.fillStyle = grade === 'neon' ? '#0a1030' : grade === 'noir' ? '#1c1c1c' : '#3a1c5e';
    ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
    ctx.fillStyle = grade === 'neon' ? 'rgba(0,229,255,0.5)' : 'rgba(255,180,120,0.55)';
    for (let i = 0; i < 5; i++) {
      const ry = y + h * (0.76 + i * 0.045);
      ctx.fillRect(x + w * (0.2 + 0.1 * i), ry, w * (0.5 - 0.07 * i), 2);
    }
  }
  if (v === 0 || v === 2) drawSkyline(ctx, x, y + h * 0.55, w, h * 0.45, grade, variant * 7 + 3);
  if (v === 1) {
    drawPalm(ctx, x + w * 0.12, y + h * 0.98, Math.min(w, h) / 190, -0.12, grade);
    drawPalm(ctx, x + w * 0.88, y + h * 0.98, Math.min(w, h) / 230, 0.14, grade);
  }
  if (v === 2) {
    drawPalm(ctx, x + w * 0.85, y + h * 0.98, Math.min(w, h) / 200, 0.18, grade);
    drawSun(ctx, x + w * 0.3, y + h * 0.3, Math.min(w, h) * 0.18, grade);
  }
  if (v === 3) drawSkyline(ctx, x, y + h * 0.62, w, h * 0.38, grade, variant * 5 + 11);
}

function drawPhotoPanel(ctx, rect, img, panel) {
  const { x, y, w, h } = rect;
  const zoom = panel.zoom || 1;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  // Pan, clamped so the photo always covers the whole panel: a pan can
  // never slide the image off an edge and expose the black backing.
  let dx = x + (w - dw) / 2 + (panel.ox || 0) * w;
  let dy = y + (h - dh) / 2 + (panel.oy || 0) * h;
  dx = Math.max(x + w - dw, Math.min(x, dx));
  dy = Math.max(y + h - dh, Math.min(y, dy));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function gradeOverlay(ctx, w, h, grade) {
  if (grade === 'noir') {
    // Desaturate everything: draw a grey wash in saturation mode.
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return;
  }
  const g = ctx.createLinearGradient(0, 0, w, h);
  if (grade === 'neon') {
    g.addColorStop(0, 'rgba(0,229,255,0.10)');
    g.addColorStop(0.5, 'rgba(123,46,255,0.08)');
    g.addColorStop(1, 'rgba(255,46,136,0.14)');
  } else {
    g.addColorStop(0, 'rgba(255,126,95,0.10)');
    g.addColorStop(0.5, 'rgba(255,94,122,0.06)');
    g.addColorStop(1, 'rgba(43,16,85,0.16)');
  }
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawCaption(ctx, w, h, caption, subcaption, grade) {
  const bandH = h * 0.16;
  const bandY = h - bandH;
  const bg = ctx.createLinearGradient(0, bandY, 0, h);
  bg.addColorStop(0, 'rgba(5,5,12,0)');
  bg.addColorStop(0.35, 'rgba(5,5,12,0.88)');
  bg.addColorStop(1, 'rgba(5,5,12,0.97)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, bandY, w, bandH);
  // Thin accent rule above the band.
  ctx.fillStyle = grade === 'neon' ? '#00e5ff' : grade === 'noir' ? '#ffffff' : '#ffb35c';
  ctx.fillRect(0, bandY, w, Math.max(3, h * 0.004));

  const text = (caption || 'SUNSET HEIST').toUpperCase();
  const size = Math.min(w * 0.11, bandH * 0.62);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`;
  try { ctx.letterSpacing = `${Math.round(size * 0.04)}px`; } catch { /* older canvas */ }
  const cx = w / 2;
  const cy = bandY + bandH * 0.48;
  const fill = ctx.createLinearGradient(0, cy - size * 0.55, 0, cy + size * 0.55);
  if (grade === 'neon') {
    fill.addColorStop(0, '#aef7ff');
    fill.addColorStop(0.5, '#00e5ff');
    fill.addColorStop(1, '#ff2e88');
  } else if (grade === 'noir') {
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(1, '#bdbdbd');
  } else {
    fill.addColorStop(0, '#fff3a6');
    fill.addColorStop(0.5, '#ff9e56');
    fill.addColorStop(1, '#ff5e7a');
  }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#12081f';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, cy);
  ctx.fillStyle = fill;
  ctx.fillText(text, cx, cy);
  ctx.restore();

  if (subcaption) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const subSize = Math.max(12, bandH * 0.16);
    ctx.font = `700 ${subSize}px Arial, Helvetica, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.3)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = grade === 'neon' ? '#9beaff' : '#ffd9a0';
    ctx.fillText(subcaption.toUpperCase(), w / 2, bandY + bandH * 0.88);
    ctx.restore();
  }
}

// state: { width, height, layout, grade, caption, subcaption,
//           panels: [{ photo: -1 | photoIndex, zoom, ox, oy }],
//           photos: [HTMLImageElement] }
// Panels with photo === -1 (or a photo that has not loaded) get drawn art.
export function drawCover(canvas, state) {
  const w = state.width;
  const h = state.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  // Outer poster frame.
  ctx.fillStyle = '#05050c';
  ctx.fillRect(0, 0, w, h);
  const gutter = Math.max(6, Math.round(Math.min(w, h) * 0.008));
  const panels = layoutPanels(state.layout || 'nine');
  const panelStates = state.panels || [];

  panels.forEach((p, i) => {
    const rect = {
      x: p.x * w + gutter,
      y: p.y * h + gutter,
      w: p.w * w - gutter * 2,
      h: p.h * h - gutter * 2,
    };
    const ps = panelStates[i] || { photo: -1, zoom: 1, ox: 0, oy: 0 };
    const img = ps.photo >= 0 ? state.photos[ps.photo] : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      drawPhotoPanel(ctx, rect, img, ps);
      // A light grade wash keeps photos and drawn panels in one world.
      ctx.fillStyle = state.grade === 'neon' ? 'rgba(255,46,136,0.06)' : state.grade === 'noir' ? 'rgba(0,0,0,0.08)' : 'rgba(255,126,95,0.07)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    } else {
      drawArtPanel(ctx, rect, i, state.grade || 'sunset');
    }
    ctx.restore();
    // Panel edge.
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = gutter * 0.5;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  gradeOverlay(ctx, w, h, state.grade || 'sunset');

  // Vignette to pull the eye to the middle.
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  drawCaption(ctx, w, h, state.caption, state.subcaption, state.grade || 'sunset');

  // Thin white poster border.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, Math.round(Math.min(w, h) * 0.003));
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  return canvas;
}

// Default crops for a fresh cover. Each panel gets a deliberately different
// crop of the same photo — a close detail here, a wide view there — so one
// photo reads as a collage, not nine copies. The centre of the nine grid
// stays a full, unzoomed hero frame. Corner panels of the nine grid use
// drawn sunset art, which gives the collage its skyline-and-palm variety.
const CROP_PRESETS = {
  nine: [
    { photo: -1, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.15, ox: 0.22, oy: 0.22 },
    { photo: 0, zoom: 1.6, ox: 0.28, oy: -0.3 },
    { photo: 0, zoom: 1.3, ox: -0.3, oy: 0.12 },
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.55, ox: 0.3, oy: 0.25 },
    { photo: 0, zoom: 1.1, ox: -0.12, oy: 0.3 },
    { photo: 0, zoom: 1.5, ox: 0.12, oy: -0.22 },
    { photo: -1, zoom: 1, ox: 0, oy: 0 },
  ],
  hero: [
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.4, ox: -0.2, oy: -0.2 },
    { photo: 0, zoom: 1.6, ox: 0.25, oy: 0.2 },
    { photo: 0, zoom: 1.2, ox: 0, oy: 0.25 },
  ],
  strip: [
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.5, ox: -0.25, oy: 0 },
    { photo: 0, zoom: 1.3, ox: 0.25, oy: -0.2 },
    { photo: 0, zoom: 1.6, ox: 0, oy: 0.2 },
  ],
};

export function defaultPanels(layout, hasPhoto) {
  const presets = CROP_PRESETS[layout] || CROP_PRESETS.nine;
  return presets.map((p) => ({
    photo: hasPhoto ? p.photo : -1,
    zoom: p.zoom,
    ox: p.ox,
    oy: p.oy,
  }));
}

// Hit-test: which panel contains canvas point (px, py)?
export function panelAt(state, px, py) {
  const panels = layoutPanels(state.layout || 'nine');
  const w = state.width;
  const h = state.height;
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (px >= p.x * w && px <= (p.x + p.w) * w && py >= p.y * h && py <= (p.y + p.h) * h) return i;
  }
  return -1;
}
