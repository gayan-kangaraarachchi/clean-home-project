// App state and persistence (localStorage). All mutations go through this module.

import { STORAGE_KEY, VIEW_KEY, HISTORY_DAYS } from './constants.js';
import { keyOf, addDays, today } from './dates.js';

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
 * @typedef {{id:string, name:string, area:string, slot:string, sched:Schedule,
 *            note:string, created:string}} Chore
 */

function starter() {
  const t = keyOf(today());
  return {
    v: 1,
    done: {},
    chores: [
      { id: 'garbage', name: 'Check garbage', area: 'waste', slot: 'evening', sched: { type: 'daily' }, note: 'Empty bins if full, sort recycling.', created: t },
      { id: 'vac-room', name: 'Vacuum the room', area: 'floors', slot: 'morning', sched: { type: 'interval', every: 2 }, note: '', created: t },
      { id: 'vac-house', name: 'Vacuum the whole house', area: 'floors', slot: 'afternoon', sched: { type: 'weekly', days: [6] }, note: 'All rooms, hallway and stairs.', created: t },
      { id: 'bath', name: 'Clean bathroom', area: 'bathroom', slot: 'morning', sched: { type: 'weekly', days: [0] }, note: 'Toilet, sink, shower, mirror, floor.', created: t },
      { id: 'dryer', name: 'Clean dryer', area: 'laundry', slot: 'any', sched: { type: 'weekly', days: [3] }, note: 'Lint filter and condenser tray.', created: t },
      { id: 'washer', name: 'Clean washing machine', area: 'laundry', slot: 'any', sched: { type: 'monthly', day: 1 }, note: 'Hot empty cycle, wipe door seal and detergent drawer.', created: t },
    ],
  };
}

const isValid = (s) => s && Array.isArray(s.chores) && s.done && typeof s.done === 'object';

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    state = isValid(parsed) ? parsed : starter();
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
