// Date helpers. Days are stored as local "YYYY-MM-DD" keys; Date objects are pinned to noon
// so daylight-saving changes never shift a day. Formatting follows the selected language.

import { getLocale } from './i18n.js';

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

const fmt = (d, opts) => d.toLocaleDateString(getLocale(), opts);

export const fmtShort = (d) => fmt(d, { day: 'numeric', month: 'short' });
export const fmtLong = (d) => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtDayMonth = (d) => fmt(d, { day: 'numeric', month: 'numeric' });

/** Short weekday name for 0 = Sunday … 6 = Saturday, in the current language. */
export function weekdayShort(dow) {
  const s = new Date(2023, 0, 1 + dow, 12).toLocaleDateString(getLocale(), { weekday: 'short' }); // 1 Jan 2023 = Sunday
  return s.charAt(0).toLocaleUpperCase(getLocale()) + s.slice(1);
}

/** "today", "tomorrow", a weekday within the week, or a short date. */
export function relDay(d) {
  const n = diffDays(d, today());
  if (n >= -1 && n <= 1) {
    return new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' }).format(n, 'day');
  }
  if (n > 1 && n < 7) return weekdayShort(d.getDay());
  return fmtShort(d);
}
