// App state and persistence (localStorage). All mutations go through this module.

import { STORAGE_KEY, VIEW_KEY, HISTORY_DAYS } from './constants.js';
import { keyOf, addDays, today } from './dates.js';
import { t, allTranslations } from './i18n.js';

/** UI state that is not persisted with the data. */
export const ui = {
  view: 'today', // 'today' | 'week' | 'habits'
  weekOffset: 0,
};

/** Persisted data: { v, chores: Chore[], done: { 'YYYY-MM-DD': choreId[] } } */
export let state = null;

/**
 * @typedef {{type:'daily'} | {type:'interval', every:number} |
 *           {type:'weekly', days:number[]} | {type:'monthly', day:number}} Schedule
 * @typedef {{id:string, name:string|null, note:string|null, tpl?:string, area:string,
 *            slot:string, sched:Schedule, created:string}} Chore
 *
 * Starter chores carry `tpl` and keep name/note = null, so they are shown in the
 * current language (locales: starter.<tpl>.name/note) until the user edits them.
 */

const STARTERS = [
  { tpl: 'garbage', area: 'waste', slot: 'evening', sched: { type: 'daily' } },
  { tpl: 'vac-room', area: 'floors', slot: 'morning', sched: { type: 'interval', every: 2 } },
  { tpl: 'vac-house', area: 'floors', slot: 'afternoon', sched: { type: 'weekly', days: [6] } },
  { tpl: 'bath', area: 'bathroom', slot: 'morning', sched: { type: 'weekly', days: [0] } },
  { tpl: 'dryer', area: 'laundry', slot: 'any', sched: { type: 'weekly', days: [3] } },
  { tpl: 'washer', area: 'laundry', slot: 'any', sched: { type: 'monthly', day: 1 } },
];

function starter() {
  const created = keyOf(today());
  return {
    v: 2,
    done: {},
    chores: STARTERS.map((s) => ({ ...s, id: s.tpl, name: null, note: null, created })),
  };
}

/** v1 stored starter chores with English text: turn untouched ones into translatable templates. */
function migrate(s) {
  if ((s.v || 1) >= 2) return s;
  for (const c of s.chores) {
    if (!STARTERS.some((x) => x.tpl === c.id)) continue;
    const base = `starter.${c.id}`;
    if (allTranslations(`${base}.name`).includes(c.name)) { c.tpl = c.id; c.name = null; }
    if (c.tpl && allTranslations(`${base}.note`).includes(c.note || '')) c.note = null;
  }
  s.v = 2;
  return s;
}

/** Name and note in the current language. */
export const choreName = (c) => c.name ?? (c.tpl ? t(`starter.${c.tpl}.name`) : '');
export const choreNote = (c) => c.note ?? (c.tpl ? t(`starter.${c.tpl}.note`) : '');

const isValid = (s) => s && Array.isArray(s.chores) && s.done && typeof s.done === 'object';

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    state = isValid(parsed) ? migrate(parsed) : starter();
  } catch {
    state = starter();
  }
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (['today', 'week', 'habits'].includes(v)) ui.view = v;
  } catch { /* storage blocked */ }
}

export function save() {
  const cutoff = keyOf(addDays(today(), -HISTORY_DAYS));
  for (const k of Object.keys(state.done)) {
    if (k < cutoff || !state.done[k].length) delete state.done[k];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function setView(view) {
  ui.view = view;
  if (view === 'week') ui.weekOffset = 0;
  try { localStorage.setItem(VIEW_KEY, view); } catch { /* ignore */ }
}

/* ---------- mutations ---------- */

export function toggleDone(id, dayKey) {
  const arr = (state.done[dayKey] ||= []);
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(id);
  save();
}

export function upsertChore(chore) {
  if (chore.id && state.chores.some((c) => c.id === chore.id)) {
    state.chores = state.chores.map((c) => (c.id === chore.id ? chore : c));
  } else {
    state.chores.push({ ...chore, id: 'h' + Date.now().toString(36), created: keyOf(today()) });
  }
  save();
}

export function deleteChore(id) {
  state.chores = state.chores.filter((c) => c.id !== id);
  for (const k in state.done) state.done[k] = state.done[k].filter((x) => x !== id);
  save();
}
