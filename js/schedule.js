// Scheduling rules: when is a chore due, is it late, and when does it come next.
// Pure functions of (chore, completion index, date) — no DOM, no storage.

import { DOW, WEEK_ORDER } from './constants.js';
import { keyOf, parseKey, addDays, diffDays, today } from './dates.js';

const LOOKBACK_DAYS = 62;

/** Build { choreId: sortedDayKeys[] } from state.done. */
export function buildDoneIndex(done) {
  const idx = {};
  for (const [k, ids] of Object.entries(done)) for (const id of ids) (idx[id] ||= []).push(k);
  for (const id in idx) idx[id].sort();
  return idx;
}

export const isDoneOn = (done, id, dayKey) => (done[dayKey] || []).includes(id);

/** Fixed-calendar rules (daily / weekly / monthly). Interval chores are not calendar-based. */
export function scheduledOn(chore, d) {
  const s = chore.sched;
  if (s.type === 'daily') return true;
  if (s.type === 'weekly') return (s.days || []).includes(d.getDay());
  if (s.type === 'monthly') {
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getDate() === Math.min(s.day || 1, daysInMonth);
  }
  return false;
}

function lastDone(chore, idx, d, inclusive) {
  const k = keyOf(d);
  const arr = idx[chore.id] || [];
  for (let i = arr.length - 1; i >= 0; i--) {
    if (inclusive ? arr[i] <= k : arr[i] < k) return parseKey(arr[i]);
  }
  return null;
}

export const lastDoneOnOrBefore = (chore, idx, d) => lastDone(chore, idx, d, true);

/**
 * Status relative to today.
 * @returns {{show:boolean, done?:boolean, lateDays?:number}}
 *   show = belongs on today's list (due, late, or already done today)
 */
export function statusToday(chore, idx, done) {
  const t = today();
  const tk = keyOf(t);
  const doneToday = isDoneOn(done, chore.id, tk);
  const created = parseKey(chore.created || tk);

  if (chore.sched.type === 'interval') {
    if (doneToday) return { show: true, done: true };
    const every = Math.max(1, chore.sched.every || 1);
    const ld = lastDone(chore, idx, t, false);
    const due = ld ? addDays(ld, every) : created;
    const late = diffDays(t, due);
    return late >= 0 ? { show: true, done: false, lateDays: late } : { show: false };
  }

  // Most recent scheduled occurrence, not before the chore was created.
  for (let i = 0; i <= LOOKBACK_DAYS; i++) {
    const d = addDays(t, -i);
    if (d < created) break;
    if (!scheduledOn(chore, d)) continue;
    if (doneToday) return { show: true, done: true };
    const ld = lastDone(chore, idx, t, false);
    if (ld && ld >= d) return { show: false }; // already done since that occurrence
    return { show: true, done: false, lateDays: i };
  }
  return doneToday ? { show: true, done: true } : { show: false };
}

/** Next date the chore is due (today if due/late now). */
export function nextDue(chore, idx, done) {
  const t = today();
  if (chore.sched.type === 'interval') {
    const ld = lastDone(chore, idx, t, true);
    const due = ld ? addDays(ld, chore.sched.every || 1) : parseKey(chore.created || keyOf(t));
    return due < t ? t : due;
  }
  const st = statusToday(chore, idx, done);
  if (st.show && !st.done) return t;
  for (let i = 1; i <= LOOKBACK_DAYS; i++) {
    const d = addDays(t, i);
    if (scheduledOn(chore, d)) return d;
  }
  return null;
}

/** Is the chore planned on day d? (Used by the week view; interval chores are projected forward.) */
export function plannedOn(chore, idx, done, d) {
  const t = today();
  if (d < parseKey(chore.created || keyOf(t)) && !isDoneOn(done, chore.id, keyOf(d))) return false;
  if (chore.sched.type !== 'interval') return scheduledOn(chore, d);
  if (d < t) return false;

  const every = Math.max(1, chore.sched.every || 1);
  const st = statusToday(chore, idx, done);
  let first;
  if (st.show && !st.done) {
    first = t;
  } else {
    const ld = lastDone(chore, idx, t, true);
    first = ld ? addDays(ld, every) : parseKey(chore.created);
    if (first < t) first = t;
  }
  const gap = diffDays(d, first);
  return gap >= 0 && gap % every === 0;
}

/** Human description of a schedule. */
export function describe(s) {
  switch (s.type) {
    case 'daily':
      return 'Every day';
    case 'interval':
      return s.every === 1 ? 'Every day' : `Every ${s.every} days`;
    case 'weekly': {
      const days = WEEK_ORDER.filter((x) => (s.days || []).includes(x));
      return days.length === 7 ? 'Every day' : 'Weekly · ' + days.map((x) => DOW[x]).join(', ');
    }
    case 'monthly':
      return `Monthly · day ${s.day}`;
    default:
      return '';
  }
}
