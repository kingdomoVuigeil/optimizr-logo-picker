import { styles, newStyles, palettes, initial, styleById, variationFor, normalizePair, paletteFor, pairId, pairName } from './catalog.js?v=2';

const byId = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
const prefix = 'optimizr.logo-picker.v1.like.';
const lastKey = 'optimizr.logo-picker.v1.current';
const favorites = new Map();
let serial = 0;
let storage;
let current = initial;
let copyTimer;

function readPair(value) {
  try {
    const data = JSON.parse(value);
    const pair = normalizePair(data);
    return pair && { ...pair, savedAt: Number.isFinite(data.savedAt) ? data.savedAt : 0 };
  } catch { return null; }
}

function loadFavorites() {
  const fromDisk = new Map();
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const item = readPair(storage.getItem(key));
    if (item && key === prefix + pairId(item)) fromDisk.set(pairId(item), item);
  }
  favorites.clear();
  for (const [key, item] of fromDisk) favorites.set(key, item);
}

function memoryOnly() {
  storage = null;
  byId('storage-note').textContent = 'Browser storage is unavailable. Copy your list before closing this tab.';
}

try {
  storage = window.localStorage;
  loadFavorites();
  current = normalizePair(readPair(storage.getItem(lastKey))) || initial;
} catch { memoryOnly(); }

function makeNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name) {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svgNS, 'use');
  use.setAttribute('href', '#' + name);
  svg.append(use);
  return svg;
}

function logo(pair, label) {
  const art = variationFor(pair);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', art.viewBox);
  svg.setAttribute('focusable', 'false');
  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  ['--ink', '--detail', '--accent'].forEach((name, index) => svg.style.setProperty(name, pair.colors[index]));
  // A machine plate has reversed lettering. Keep it readable with a custom light ink.
  const rgb = [1,3,5].map(i => parseInt(pair.colors[0].slice(i, i + 2), 16) / 255);
  const lum = rgb.map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  const lightness = .2126 * lum[0] + .7152 * lum[1] + .0722 * lum[2];
  svg.style.setProperty('--knockout', lightness > .179 ? '#13151A' : '#FFFFFF');
  // The geometry is bundled with the app. Namespace clip paths and gradients per preview.
  svg.innerHTML = art.paths.replaceAll('__mark__', 'mark' + (++serial) + '-');
  return svg;
}

function swatches(colors) {
  return colors.map(color => {
    const ink = makeNode('i');
    ink.style.backgroundColor = color;
    return ink;
  });
}

function tell(message) { byId('status').textContent = message; }

const paletteButtons = palettes.map(palette => {
  const button = makeNode('button', 'palette');
  button.type = 'button';
  button.title = palette.name;
  button.setAttribute('aria-label', palette.name);
  const bar = makeNode('span', 'bar');
  bar.setAttribute('aria-hidden', 'true');
  bar.append(...swatches(palette.colors));
  button.append(bar, makeNode('span', 'palette-name', palette.short));
  button.addEventListener('click', () => select({ ...current, colors: palette.colors }));
  byId('palettes').append(button);
  return button;
});

const customInputs = ['Main ink', 'Detail', 'Accent'].map((name, index) => {
  const label = makeNode('label', 'custom-ink');
  const input = makeNode('input');
  input.type = 'color';
  input.setAttribute('aria-label', name);
  const value = makeNode('span', 'hex');
  label.append(makeNode('span', '', name), input, value);
  byId('custom-inks').append(label);
  input.addEventListener('input', () => {
    const colors = [...current.colors];
    colors[index] = input.value.toUpperCase();
    select({ ...current, colors }, false);
  });
  input.addEventListener('change', () => select(current));
  return { input, value };
});

function refreshLikeButton() {
  const saved = favorites.has(pairId(current));
  byId('like').disabled = saved;
  byId('like-label').textContent = saved ? 'Liked' : 'Like combination';
  byId('like-icon').firstElementChild.setAttribute('href', saved ? '#check' : '#heart');
}

const variationGrid = byId('variations');

function showVariations(style, previous) {
  const familyChanged = !variationGrid.childElementCount || previous.style !== style.id;
  if (familyChanged) {
    const choices = style.variations.map(variation => {
      const button = makeNode('button', 'variation-card');
      button.type = 'button';
      const selectedMark = icon('check');
      selectedMark.classList.add('variation-check');
      button.append(makeNode('span', 'variation-art'), makeNode('span', 'variation-name', variation.name), selectedMark);
      button.addEventListener('click', () => {
        select({ ...current, variation: variation.id });
        tell(pairName(current));
      });
      return button;
    });
    variationGrid.replaceChildren(...choices);
  }
  const redraw = familyChanged || current.colors.some((color, index) => color !== previous.colors[index]);
  style.variations.forEach((variation, index) => {
    const button = variationGrid.children[index];
    button.setAttribute('aria-pressed', String(current.variation === variation.id));
    if (redraw) button.firstElementChild.replaceChildren(logo({ ...current, variation: variation.id }));
  });
}

function select(pair, persist = true) {
  const previous = current;
  current = normalizePair(pair);
  const style = styleById.get(current.style);
  const palette = paletteFor(current.colors);
  const variation = variationFor(current);
  byId('main-art').replaceChildren(logo(current, 'OptimizR GmbH, ' + pairName(current)));
  byId('preview-style').textContent = style.name + ' · ' + variation.name;
  byId('preview-palette').textContent = palette.name;
  byId('style-value').textContent = style.name;
  byId('choose-style').setAttribute('aria-label', 'Choose logo style, current style ' + style.name);
  byId('preview-inks').replaceChildren(...swatches(current.colors));
  showVariations(style, previous);
  paletteButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(palette === palettes[index])));
  customInputs.forEach(({ input, value }, index) => {
    input.value = current.colors[index];
    value.textContent = current.colors[index];
  });
  refreshLikeButton();
  if (storage && persist) {
    try { storage.setItem(lastKey, JSON.stringify(current)); } catch { memoryOnly(); }
  }
}

function selectStyle(id) {
  select({ ...current, style: id, variation: id === current.style ? current.variation : 'original' });
}

function stepStyle(delta) {
  const index = styles.findIndex(style => style.id === current.style);
  selectStyle(styles[(index + delta + styles.length) % styles.length].id);
  tell(pairName(current));
}
byId('prev-style').addEventListener('click', () => stepStyle(-1));
byId('next-style').addEventListener('click', () => stepStyle(1));

const stylesDialog = byId('styles-dialog');
const allStylesButton = byId('all-styles');
const newStylesButton = byId('new-styles');
byId('all-total').textContent = String(styles.length);
byId('new-total').textContent = String(newStyles.length);
const galleryOrder = [...newStyles, ...styles.filter(style => !newStyles.includes(style))];

function showGallery(newOnly) {
  allStylesButton.setAttribute('aria-pressed', String(!newOnly));
  newStylesButton.setAttribute('aria-pressed', String(newOnly));
  const choices = (newOnly ? newStyles : galleryOrder).map(style => {
    const button = makeNode('button', 'style-card');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(style.id === current.style));
    const miniature = makeNode('span');
    miniature.append(logo({ style: style.id, variation: 'original', colors: current.colors }));
    button.append(miniature, makeNode('span', 'style-name', style.name));
    button.addEventListener('click', () => {
      selectStyle(style.id);
      stylesDialog.close();
      tell(pairName(current));
    });
    return button;
  });
  byId('styles-grid').replaceChildren(...choices);
  byId('styles-grid').scrollTop = 0;
}

allStylesButton.addEventListener('click', () => showGallery(false));
newStylesButton.addEventListener('click', () => showGallery(true));
byId('choose-style').addEventListener('click', () => {
  showGallery(newStylesButton.getAttribute('aria-pressed') === 'true');
  stylesDialog.showModal();
  (newStylesButton.getAttribute('aria-pressed') === 'true' ? newStylesButton : allStylesButton).focus();
});

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
}

function sortedFavorites() {
  return [...favorites.values()].sort((a,b) => a.savedAt - b.savedAt || pairId(a).localeCompare(pairId(b)));
}

function renderFavorites() {
  const items = sortedFavorites();
  const rows = items.map(item => {
    const row = makeNode('li', 'saved');
    const name = pairName(item);
    const reopen = makeNode('button', 'reopen');
    reopen.type = 'button';
    reopen.title = 'Preview ' + name;
    const miniature = makeNode('span', 'saved-art');
    miniature.append(logo(item));
    reopen.append(miniature, makeNode('span', '', name));
    reopen.addEventListener('click', () => {
      select(item);
      byId('picker').scrollIntoView({ block: 'start' });
      byId('choose-style').focus({ preventScroll: true });
      tell('Previewing ' + name);
    });
    const remove = makeNode('button', 'icon-button plain');
    remove.type = 'button';
    remove.title = 'Remove ' + name;
    remove.setAttribute('aria-label', remove.title);
    remove.append(icon('close'));
    remove.addEventListener('click', () => {
      const index = items.indexOf(item);
      const id = pairId(item);
      if (storage) {
        try { storage.removeItem(prefix + id); } catch { memoryOnly(); }
      }
      favorites.delete(id);
      renderFavorites();
      const remaining = byId('liked-list').children;
      (remaining[Math.min(index, remaining.length - 1)]?.querySelector('.plain') || byId('liked-heading')).focus({ preventScroll: true });
      tell('Removed ' + name);
    });
    row.append(reopen, remove);
    return row;
  });
  byId('liked-list').replaceChildren(...rows);
  byId('empty').hidden = items.length > 0;
  byId('nav-count').textContent = String(items.length);
  byId('list-count').textContent = String(items.length);
  byId('copy-all').disabled = !items.length;
  clearTimeout(copyTimer);
  byId('copy-label').textContent = 'Copy all';
  refreshLikeButton();
}

byId('like').addEventListener('click', () => {
  const id = pairId(current);
  if (favorites.has(id)) return;
  let item = { ...current, savedAt: Date.now() };
  if (storage) {
    try {
      const existing = readPair(storage.getItem(prefix + id));
      if (existing && pairId(existing) === id) item = existing;
      else storage.setItem(prefix + id, JSON.stringify(item));
    } catch { memoryOnly(); }
  }
  favorites.set(id, item);
  renderFavorites();
  tell('Liked ' + pairName(current));
});

window.addEventListener('storage', event => {
  if (!storage || event.storageArea !== storage || (event.key !== null && !event.key.startsWith(prefix))) return;
  try { loadFavorites(); renderFavorites(); } catch { memoryOnly(); }
});

async function copyList(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const temporary = makeNode('textarea');
    temporary.value = text;
    temporary.readOnly = true;
    temporary.style.cssText = 'position:fixed;top:0;left:-9999px';
    document.body.append(temporary);
    try {
      temporary.focus({ preventScroll: true });
      temporary.select();
      return document.execCommand('copy');
    } catch { return false; }
    finally {
      temporary.remove();
      byId('copy-all').focus({ preventScroll: true });
    }
  }
}

byId('copy-all').addEventListener('click', async () => {
  const text = sortedFavorites().map(pairName).join('\n');
  if (!text) return;
  if (await copyList(text)) {
    byId('copy-label').textContent = 'Copied';
    tell('Copied all liked combinations.');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { byId('copy-label').textContent = 'Copy all'; }, 2200);
  } else {
    byId('copy-text').value = text;
    byId('copy-dialog').showModal();
    byId('copy-text').focus();
    byId('copy-text').select();
  }
});

byId('brand-art').replaceChildren(logo({ style: 'conveyor-flow', colors: initial.colors }));
select(current, false);
renderFavorites();
