// shots.js — screenshot scene runner.
// Reads the URL query (?shot=cover|editor, ?photo=, ?caption=, ?size=,
// ?layout=, ?grade=), loads the sample photo and caption, paints the
// cover, then sets window.__shotReady = true once painted.
// Cover mode hides the editor controls (body.shot-cover); editor mode
// shows the full editor. Plain module script, no libraries.

import { SIZES, drawCover, layoutPanels, defaultPanels } from './cover.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot') || 'cover';

function sizeKey() {
  const s = params.get('size') || '1920x1080';
  return SIZES[s] ? s : '1920x1080';
}

function sampleSrc(photo) {
  if (photo === 'boulevard') return 'samples/boulevard.jpg';
  return 'samples/pier.jpg';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function paint() {
  const key = sizeKey();
  const layout = params.get('layout') || 'nine';
  const grade = params.get('grade') || 'sunset';
  const caption = params.get('caption') || 'Sunset Heist';
  const photo = params.get('photo') || 'pier';

  if (shot === 'cover') document.body.classList.add('shot-cover');

  if (shot === 'editor') {
    // The editor module (main.js) is already running: do not repaint over
    // it. Wait until its first photo has loaded and painted, then signal.
    const statusEl = document.getElementById('status');
    const started = Date.now();
    while (Date.now() - started < 8000) {
      if (statusEl && /loaded into slot/.test(statusEl.textContent || '')) break;
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 400));
    window.__shotReady = true;
    return;
  }

  const canvas = document.getElementById('cover');
  let img = null;
  try {
    img = await loadImage(sampleSrc(photo));
  } catch {
    img = null; // fall back to fully drawn panels
  }

  drawCover(canvas, {
    width: SIZES[key].w,
    height: SIZES[key].h,
    layout: layoutPanels(layout) ? layout : 'nine',
    grade: ['sunset', 'neon', 'noir'].includes(grade) ? grade : 'sunset',
    caption,
    subcaption: params.get('sub') || 'Vice City Stories',
    panels: defaultPanels(layoutPanels(layout) ? layout : 'nine', Boolean(img)),
    photos: [img],
  });

  window.__shotReady = true;
}

paint().catch(() => {
  window.__shotReady = true;
});
