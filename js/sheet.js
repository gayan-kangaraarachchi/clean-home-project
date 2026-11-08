// Add / edit habit bottom sheet.

import { AREA_KEYS, SLOT_KEYS, WEEK_ORDER } from './constants.js';
import { today, weekdayShort } from './dates.js';
import { t } from './i18n.js';
import { state, upsertChore, deleteChore, choreName, choreNote } from './store.js';
import { render, esc } from './render.js';

const host = () => document.getElementById('sheetHost');

function options(keys, group, selected) {
  return keys
    .map((k) => `<option value="${k}"${k === selected ? ' selected' : ''}>${t(`${group}.${k}`)}</option>`)
    .join('');
}

function template(c, isEdit) {
  const s = c.sched;
  const sel = (type) => (s.type === type ? ' selected' : '');
  return `<div class="scrim" id="scrim"><form class="sheet" id="f" novalidate>
    <h2>${t(isEdit ? 'form.titleEdit' : 'form.titleNew')}</h2>
    <div class="field"><label for="f-name">${t('form.name')}</label>
      <input id="f-name" maxlength="60" value="${esc(choreName(c))}" placeholder="${esc(t('form.namePlaceholder'))}" required></div>
    <div class="two">
      <div class="field"><label for="f-area">${t('form.area')}</label><select id="f-area">${options(AREA_KEYS, 'areas', c.area)}</select></div>
      <div class="field"><label for="f-slot">${t('form.slot')}</label><select id="f-slot">${options(SLOT_KEYS, 'slots', c.slot || 'any')}</select></div>
    </div>
    <div class="field"><label for="f-type">${t('form.repeats')}</label><select id="f-type">
      <option value="daily"${sel('daily')}>${t('form.optDaily')}</option>
      <option value="interval"${sel('interval')}>${t('form.optInterval')}</option>
      <option value="weekly"${sel('weekly')}>${t('form.optWeekly')}</option>
      <option value="monthly"${sel('monthly')}>${t('form.optMonthly')}</option></select></div>
    <div class="field" id="o-interval"><label for="f-every">${t('form.every')}</label>
      <div class="inline"><input id="f-every" type="number" min="1" max="90" value="${s.every || 2}"><span>${t('form.everyHint')}</span></div></div>
    <div class="field" id="o-weekly"><span class="lbl">${t('form.days')}</span><div class="days">
      ${WEEK_ORDER.map((d) => `<label><input type="checkbox" id="f-d${d}" value="${d}"${(s.days || []).includes(d) ? ' checked' : ''}><span>${weekdayShort(d)}</span></label>`).join('')}
    </div></div>
    <div class="field" id="o-monthly"><label for="f-mday">${t('form.monthDay')}</label>
      <div class="inline"><input id="f-mday" type="number" min="1" max="31" value="${s.day || 1}"><span>${t('form.monthDayHint')}</span></div></div>
    <div class="field"><label for="f-note">${t('form.notes')}</label>
      <textarea id="f-note" rows="2" maxlength="200" placeholder="${esc(t('form.notesPlaceholder'))}">${esc(choreNote(c))}</textarea></div>
    <p class="err" id="f-err" hidden></p>
    <div class="actions">
      ${isEdit ? `<button type="button" class="btn danger" id="f-del">${t('form.delete')}</button>` : ''}
      <div class="r"><button type="button" class="btn ghost" id="f-cancel">${t('form.cancel')}</button><button type="submit" class="btn">${t('form.save')}</button></div>
    </div>
  </form></div>`;
}

/** Read and validate the repeat settings. Returns {sched} or {error}. */
function readSchedule(q) {
  const type = q('#f-type').value;
  const sched = { type };
  if (type === 'interval') {
    const n = parseInt(q('#f-every').value, 10);
    if (!(n >= 1 && n <= 90)) return { error: t('form.errEvery') };
    sched.every = n;
  }
  if (type === 'weekly') {
    sched.days = WEEK_ORDER.filter((d) => q('#f-d' + d).checked);
    if (!sched.days.length) return { error: t('form.errDays') };
  }
  if (type === 'monthly') {
    const n = parseInt(q('#f-mday').value, 10);
    if (!(n >= 1 && n <= 31)) return { error: t('form.errMonthDay') };
    sched.day = n;
  }
  return { sched };
}

export function openSheet(id) {
  const existing = state.chores.find((c) => c.id === id);
  const chore = existing
    ? structuredClone(existing)
    : { name: '', note: '', area: 'other', slot: 'any', sched: { type: 'weekly', days: [today().getDay()] } };

  const root = host();
  root.innerHTML = template(chore, Boolean(existing));
  const q = (sel) => root.querySelector(sel);

  const syncRepeatFields = () => {
    const v = q('#f-type').value;
    q('#o-interval').hidden = v !== 'interval';
    q('#o-weekly').hidden = v !== 'weekly';
    q('#o-monthly').hidden = v !== 'monthly';
  };
  syncRepeatFields();
  q('#f-type').addEventListener('change', syncRepeatFields);

  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  };
  document.addEventListener('keydown', onKey);
  q('#f-cancel').addEventListener('click', close);
  q('#scrim').addEventListener('click', (e) => { if (e.target.id === 'scrim') close(); });

  if (existing) {
    q('#f-del').addEventListener('click', (e) => {
      const b = e.currentTarget;
      if (!b.classList.contains('armed')) {
        b.classList.add('armed');
        b.textContent = t('form.deleteConfirm');
        return;
      }
      deleteChore(id);
      close();
      render();
    });
  }

  q('#f').addEventListener('submit', (e) => {
    e.preventDefault();
    const err = q('#f-err');
    const fail = (msg, focus) => { err.textContent = msg; err.hidden = false; focus?.focus(); };
    err.hidden = true;

    const name = q('#f-name').value.trim();
    if (!name) return fail(t('form.errName'), q('#f-name'));

    const { sched, error } = readSchedule(q);
    if (error) return fail(error);

    const note = q('#f-note').value.trim();
    upsertChore({
      ...chore,
      // Starter chores stay translatable while their text is left as the default.
      name: chore.tpl && name === choreName({ tpl: chore.tpl, name: null }) ? null : name,
      note: chore.tpl && note === choreNote({ tpl: chore.tpl, note: null }) ? null : note,
      area: q('#f-area').value,
      slot: q('#f-slot').value,
      sched,
    });
    close();
    render();
  });

  q('#f-name').focus();
}
