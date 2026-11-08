// Entry point: language, data, events, service worker.

import { keyOf } from './dates.js';
import { initLocale, setLocale, getLocale, fillLanguagePicker, t } from './i18n.js';
import { load, save, setView, toggleDone, ui } from './store.js';
import { render } from './render.js';
import { openSheet } from './sheet.js';

let storageOk = true;

function onClick(e) {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.view) { setView(b.dataset.view); render(); return; }
  if (b.dataset.toggle) { toggleDone(b.dataset.toggle, b.dataset.k); render(); return; }
  if (b.dataset.week) { ui.weekOffset += Number(b.dataset.week); render(); return; }
  if (b.hasAttribute('data-add')) { openSheet(null); return; }
  if (b.dataset.edit) { openSheet(b.dataset.edit); }
}

function renderStorageNote() {
  document.getElementById('storeNote').textContent = t(storageOk ? 'storage.saved' : 'storage.blocked');
}

function setupLanguagePicker() {
  const select = document.getElementById('langSelect');
  fillLanguagePicker(select);
  select.addEventListener('change', () => {
    setLocale(select.value);
    document.getElementById('sheetHost').innerHTML = ''; // close an open form; it would be in the old language
    renderStorageNote();
    render();
  });
  select.value = getLocale();
}

function watchDayChange() {
  let lastDay = keyOf(new Date());
  const check = () => {
    const k = keyOf(new Date());
    if (k !== lastDay) { lastDay = k; render(); }
  };
  setInterval(check, 60_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable */ });
  }
}

function start() {
  initLocale();
  load();
  storageOk = save();
  setupLanguagePicker();
  renderStorageNote();
  document.addEventListener('click', onClick);
  render();
  watchDayChange();
  registerServiceWorker();
}

start();
