// Add / edit habit bottom sheet.

import { AREAS, SLOTS, DOW, WEEK_ORDER } from './constants.js';
import { today } from './dates.js';
import { state, upsertChore, deleteChore } from './store.js';
import { render, esc } from './render.js';

const host = () => document.getElementById('sheetHost');

function options(map, selected) {
  return Object.entries(map)
    .map(([k, v]) => `<option value="${k}"${k === selected ? ' selected' : ''}>${v}</option>`)
    .join('');
}

function template(c, isEdit) {
  const s = c.sched;
  const sel = (t) => (s.type === t ? ' selected' : '');
  return `<div class="scrim" id="scrim"><form class="sheet" id="f" novalidate>
    <h2>${isEdit ? 'Edit habit' : 'New habit'}</h2>
    <div class="field"><label for="f-name">Name</label>
      <input id="f-name" maxlength="60" value="${esc(c.name)}" placeholder="e.g. Clean the fridge" required></div>
    <div class="two">
      <div class="field"><label for="f-area">Area</label><select id="f-area">${options(AREAS, c.area)}</select></div>
      <div class="field"><label for="f-slot">Time of day</label><select id="f-slot">${options(SLOTS, c.slot || 'any')}</select></div>
    </div>
    <div class="field"><label for="f-type">Repeats</label><select id="f-type">
      <option value="daily"${sel('daily')}>Every day</option>
      <option value="interval"${sel('interval')}>Every few days</option>
      <option value="weekly"${sel('weekly')}>On weekdays I pick</option>
      <option value="monthly"${sel('monthly')}>Once a month</option></select></div>
    <div class="field" id="o-interval"><label for="f-every">Repeat every</label>
      <div class="inline"><input id="f-every" type="number" min="1" max="90" value="${s.every || 2}"><span>days after it was last done</span></div></div>
    <div class="field" id="o-weekly"><span class="lbl">On these days</span><div class="days">
      ${WEEK_ORDER.map((d) => `<label><input type="checkbox" id="f-d${d}" value="${d}"${(s.days || []).includes(d) ? ' checked' : ''}><span>${DOW[d]}</span></label>`).join('')}
    </div></div>
    <div class="field" id="o-monthly"><label for="f-mday">Day of month</label>
      <div class="inline"><input id="f-mday" type="number" min="1" max="31" value="${s.day || 1}"><span>moves to the last day in shorter months</span></div></div>
    <div class="field"><label for="f-note">Notes</label>
      <textarea id="f-note" rows="2" maxlength="200" placeholder="Optional checklist or tip">${esc(c.note || '')}</textarea></div>
    <p class="err" id="f-err" hidden></p>
    <div class="actions">
      ${isEdit ? '<button type="button" class="btn danger" id="f-del">Delete</button>' : ''}
      <div class="r"><button type="button" class="btn ghost" id="f-cancel">Cancel</button><button type="submit" class="btn">Save</button></div>
    </div>
  </form></div>`;
}

/** Read and validate the form. Returns {sched} or {error}. */
function readSchedule(q) {
  const type = q('#f-type').value;
  const sched = { type };
  if (type === 'interval') {
    const n = parseInt(q('#f-every').value, 10);
    if (!(n >= 1 && n <= 90)) return { error: 'Repeat every 1 to 90 days.' };
    sched.every = n;
  }
  if (type === 'weekly') {
    sched.days = WEEK_ORDER.filter((d) => q('#f-d' + d).checked);
    if (!sched.days.length) return { error: 'Pick at least one day.' };
  }
  if (type === 'monthly') {
    const n = parseInt(q('#f-mday').value, 10);
    if (!(n >= 1 && n <= 31)) return { error: 'Pick a day from 1 to 31.' };
    sched.day = n;
  }
  return { sched };
}

export function openSheet(id) {
  const existing = state.chores.find((c) => c.id === id);
  const chore = existing
    ? structuredClone(existing)
    : { name: '', area: 'other', slot: 'any', sched: { type: 'weekly', days: [today().getDay()] }, note: '' };

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
        b.textContent = 'Tap again to delete';
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
    if (!name) return fail('Give the habit a name.', q('#f-name'));

    const { sched, error } = readSchedule(q);
    if (error) return fail(error);

    upsertChore({
      ...chore,
      name,
      area: q('#f-area').value,
      slot: q('#f-slot').value,
      sched,
      note: q('#f-note').value.trim(),
    });
    close();
    render();
  });

  q('#f-name').focus();
}
