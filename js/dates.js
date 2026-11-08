// Date helpers. Days are stored as local "YYYY-MM-DD" keys; Date objects are pinned to noon
// so daylight-saving changes never shift a day.

import { DOW } from './constants.js';

const pad = (n) => String(n).padStart(2, '0');

export const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Whole days from b to a (a - b). */
export const diffDays = (a, b) => Math.round((parseKey(keyOf(a)) - parseKey(keyOf(b))) / 864e5);

export const today = () => parseKey(keyOf(new Date()));

export const fmtShort = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export const fmtLong = (d) =>
  d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** "today", "tomorrow", "Wed", or a short date. */
export function relDay(d) {
  const n = diffDays(d, today());
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  if (n > 1 && n < 7) return DOW[d.getDay()];
  return fmtShort(d);
}
