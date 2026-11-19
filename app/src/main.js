// main.js — editor logic for Vice City Cover Maker.
// Wires the controls to the renderer in cover.js: loading photos,
// picking a panel, dragging to pan, zooming, caption, grade, layout,
// export size and PNG export. Plain DOM, no libraries.

import { LAYOUTS, GRADES, SIZES, layoutPanels, defaultPanels, drawCover, panelAt } from './cover.js';

const SAMPLES = [
  { key: 'pier', label: 'Pier sunset', src: 'samples/pier.jpg' },
  { key: 'boulevard', label: 'Boulevard', src: 'samples/boulevard.jpg' },
];

const state = {
  width: 1920,
  height: 1080,
  sizeKey: '1920x1080',
  layout: 'nine',
  grade: 'sunset',
  caption: 'Sunset Heist',
  subcaption: 'Vice City Stories',
  // photos[i] is { key, label, img } or null
  photos: [null, null, null],
  // one entry per panel of the current layout; rebuilt on layout change
  panels: [],
  selected: 4, // centre panel of the nine grid by default
};

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subInput = document.getElementById('subcaption');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');
const panelLabel = document.getElementById('panel-label');
const statusEl = document.getElementById('status');

function panelCount() {
  return layoutPanels(state.layout).length;
}

function defaultPanelsForState() {
  return defaultPanels(state.layout, state.photos.some(Boolean));
}

function syncPanels() {
  const wanted = panelCount();
  if (state.panels.length !== wanted) state.panels = defaultPanelsForState();
  state.panels.forEach((p) => {
    if (p.photo >= 0 && !state.photos[p.photo]) p.photo = state.photos.findIndex(Boolean);
  });
  if (state.selected >= wanted) state.selected = Math.min(wanted - 1, 4);
}

function renderState() {
  return {
    width: state.width,
    height: state.height,
    layout: state.layout,
    grade: state.grade,
    caption: state.caption,
    subcaption: state.subcaption,
    panels: state.panels,
    photos: state.photos.map((p) => (p ? p.img : null)),
  };
}

function render() {
  syncPanels();
  drawCover(canvas, renderState());
  updatePanelUI();
}

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function updatePanelUI() {
  const p = state.panels[state.selected];
  if (!p) return;
  panelLabel.textContent = `Panel ${state.selected + 1} of ${state.panels.length}`;
  zoomInput.value = String(Math.round((p.zoom || 1) * 100));
  zoomValue.textContent = `${Math.round((p.zoom || 1) * 100)}%`;
  document.querySelectorAll('#panel-photo button').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.photo) === p.photo);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function setPhoto(slot, src, label) {
  try {
    const img = await loadImage(src);
    const hadPhoto = state.photos.some(Boolean);
    state.photos[slot] = { key: label, label, img };
    // First photo ever: rebuild panels from the layout preset, which puts
    // the photo in the photo panels and keeps the drawn-art corners as art.
    // Later photos leave the panel assignment alone.
    if (!hadPhoto) state.panels = defaultPanelsForState();
    buildPhotoSlots();
    buildPanelPhotoButtons();
    render();
    setStatus(`${label} loaded into slot ${slot + 1}.`);
  } catch (err) {
    setStatus(`Photo failed to load: ${err.message}`);
  }
}

function buildPhotoSlots() {
  const wrap = document.getElementById('photo-slots');
  wrap.innerHTML = '';
  state.photos.forEach((slot, i) => {
    const div = document.createElement('div');
    div.className = 'slot';
    const title = document.createElement('div');
    title.className = 'slot-title';
    title.textContent = slot ? `Photo ${i + 1}: ${slot.label}` : `Photo ${i + 1}: empty`;
    div.appendChild(title);
    if (slot) {
      const thumb = document.createElement('img');
      thumb.src = slot.img.src;
      thumb.alt = slot.label;
      div.appendChild(thumb);
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.textContent = 'Remove';
      clear.addEventListener('click', () => {
        state.photos[i] = null;
        state.panels.forEach((p) => {
          if (p.photo === i) p.photo = state.photos.findIndex(Boolean);
        });
        buildPhotoSlots();
        buildPanelPhotoButtons();
        render();
        setStatus(`Photo ${i + 1} removed.`);
      });
      div.appendChild(clear);
    }
    const fileLabel = document.createElement('label');
    fileLabel.className = 'file-btn';
    fileLabel.textContent = 'Upload file…';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      setPhoto(i, url, f.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Uploaded photo');
    });
    fileLabel.appendChild(file);
    div.appendChild(fileLabel);
    SAMPLES.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `Sample: ${s.label}`;
      b.addEventListener('click', () => setPhoto(i, s.src, s.label));
      div.appendChild(b);
    });
    wrap.appendChild(div);
  });
}

function buildOptionButtons(elId, options, current, onPick) {
  const wrap = document.getElementById(elId);
  wrap.innerHTML = '';
  Object.entries(options).forEach(([key, opt]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.key = key;
    b.textContent = opt.label;
    b.title = opt.hint || '';
    if (key === current) b.classList.add('active');
    b.addEventListener('click', () => {
      wrap.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      onPick(key);
    });
    wrap.appendChild(b);
  });
}

function buildPanelPhotoButtons() {
  const wrap = document.getElementById('panel-photo');
  wrap.innerHTML = '';
  const art = document.createElement('button');
  art.type = 'button';
  art.dataset.photo = '-1';
  art.textContent = 'Drawn art';
  art.addEventListener('click', () => {
    state.panels[state.selected].photo = -1;
    render();
  });
  wrap.appendChild(art);
  state.photos.forEach((slot, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.photo = String(i);
    b.textContent = slot ? `Photo ${i + 1}` : `Photo ${i + 1} (empty)`;
    b.disabled = !slot;
    b.addEventListener('click', () => {
      state.panels[state.selected].photo = i;
      render();
    });
    wrap.appendChild(b);
  });
  const all = document.createElement('button');
  all.type = 'button';
  all.textContent = 'Fill all panels';
  all.addEventListener('click', () => {
    const p = state.panels[state.selected];
    state.panels.forEach((panel) => {
      panel.photo = p.photo;
    });
    render();
    setStatus('All panels now use the selected panel’s image.');
  });
  wrap.appendChild(all);
}

// Drag to pan the panel under the pointer; click selects a panel.
let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * state.width,
    y: ((e.clientY - r.top) / r.height) * state.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const pt = canvasPoint(e);
  const idx = panelAt(renderState(), pt.x, pt.y);
  if (idx < 0) return;
  state.selected = idx;
  canvas.setPointerCapture(e.pointerId);
  drag = { idx, startX: pt.x, startY: pt.y, ox: state.panels[idx].ox || 0, oy: state.panels[idx].oy || 0, moved: false };
  render();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const pt = canvasPoint(e);
  const dx = (pt.x - drag.startX) / state.width;
  const dy = (pt.y - drag.startY) / state.height;
  if (Math.abs(dx) + Math.abs(dy) > 0.002) drag.moved = true;
  const p = state.panels[drag.idx];
  p.ox = Math.max(-0.6, Math.min(0.6, drag.ox + dx));
  p.oy = Math.max(-0.6, Math.min(0.6, drag.oy + dy));
  render();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) setStatus(`Panel ${drag.idx + 1} repositioned — drag again or use zoom.`);
  drag = null;
});

captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  render();
});
subInput.addEventListener('input', () => {
  state.subcaption = subInput.value;
  render();
});
zoomInput.addEventListener('input', () => {
  const p = state.panels[state.selected];
  if (!p) return;
  p.zoom = Number(zoomInput.value) / 100;
  zoomValue.textContent = `${zoomInput.value}%`;
  render();
});

document.getElementById('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed — please try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${state.sizeKey}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported ${state.sizeKey} PNG.`);
  }, 'image/png');
});

document.getElementById('reset-crops').addEventListener('click', () => {
  state.panels = defaultPanelsForState();
  render();
  setStatus('Panel crops reset.');
});

buildOptionButtons('layout-btns', LAYOUTS, state.layout, (key) => {
  state.layout = key;
  state.panels = defaultPanelsForState();
  state.selected = key === 'nine' ? 4 : 0;
  render();
});
buildOptionButtons('grade-btns', GRADES, state.grade, (key) => {
  state.grade = key;
  render();
});
buildOptionButtons('size-btns', SIZES, state.sizeKey, (key) => {
  state.sizeKey = key;
  state.width = SIZES[key].w;
  state.height = SIZES[key].h;
  render();
  setStatus(`Export size ${SIZES[key].label}.`);
});

buildPhotoSlots();
buildPanelPhotoButtons();
state.panels = defaultPanelsForState();
render();
// Preload the pier sample so the first paint already looks like a cover.
setPhoto(0, 'samples/pier.jpg', 'Pier sunset');
