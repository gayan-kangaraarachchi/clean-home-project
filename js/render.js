// View rendering: header progress ring and the Today / Week / Habits views.

import { SLOT_KEYS, ICONS, CHECK_ICON, areaColor } from './constants.js';
import { keyOf, addDays, diffDays, today, fmtShort, fmtLong, fmtDayMonth, weekdayShort, relDay } from './dates.js';
import { t } from './i18n.js';
import { state, ui, choreName, choreNote } from './store.js';
import {
  buildDoneIndex, isDoneOn, statusToday, nextDue, plannedOn, lastDoneOnOrBefore, describe,
} from './schedule.js';

const $ = (id) => document.getElementById(id);

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const glyph = (c) =>
  `<span class="glyph" style="--c:${areaColor(c.area)}">${ICONS[c.area] || ICONS.other}</span>`;

function todayItems(idx) {
  return state.chores
    .map((c) => ({ c, st: statusToday(c, idx, state.done) }))
    .filter((x) => x.st.show);
}

/* ---------- header ---------- */

function renderHeader(idx) {
  const items = todayItems(idx);
  const total = items.length;
  const done = items.filter((x) => x.st.done).length;
  const left = total - done;
  const late = items.filter((x) => !x.st.done && x.st.lateDays > 0).length;

  $('dateLine').textContent = fmtLong(today());
  $('headline').textContent =
    total === 0 ? t('header.nothingDue') : left === 0 ? t('header.allDone') : t('header.left', { n: left });
  $('subline').textContent =
    total === 0 ? t('header.subNothing')
      : left === 0 ? t('header.subAllDone')
        : late ? t('header.subLate', { n: late }) : t('header.subDefault');

  const frac = total ? done / total : 0;
  $('ringArc').setAttribute('stroke-dashoffset', (100.5 * (1 - frac)).toFixed(1));
  $('ringNum').textContent = `${done}/${total}`;
}

/* ---------- today ---------- */

function choreRow(c, st, dayKey) {
  const name = choreName(c);
  const note = choreNote(c);
  let pill = '';
  if (st.done) pill = `<span class="pill ok">${t('pill.done')}</span>`;
  else if (st.lateDays === 1) pill = `<span class="pill late">${t('pill.fromYesterday')}</span>`;
  else if (st.lateDays > 1) pill = `<span class="pill late">${t('pill.late', { n: st.lateDays })}</span>`;

  const label = t(st.done ? 'today.markNotDone' : 'today.markDone', { name });
  return `<div class="row${st.done ? ' done' : ''}">
    <button class="check" data-toggle="${esc(c.id)}" data-k="${dayKey}" aria-label="${esc(label)}">${CHECK_ICON}</button>
    ${glyph(c)}
    <div class="info">
      <div class="name">${esc(name)}</div>
      <div class="meta"><span>${t('areas.' + c.area)}</span><span>${describe(c.sched)}</span>${pill}</div>
      ${note ? `<div class="meta">${esc(note)}</div>` : ''}
    </div>
  </div>`;
}

function upcoming(idx) {
  const t0 = today();
  const soon = state.chores
    .map((c) => ({ c, st: statusToday(c, idx, state.done), nd: nextDue(c, idx, state.done) }))
    .filter((x) => !x.st.show && x.nd && diffDays(x.nd, t0) > 0 && diffDays(x.nd, t0) <= 3)
    .sort((a, b) => a.nd - b.nd);
  if (!soon.length) return '';

  return `<section class="group"><h2>${t('today.comingUp')}</h2>${soon.map((x) => `
    <div class="row">${glyph(x.c)}
      <div class="info"><div class="name">${esc(choreName(x.c))}</div>
        <div class="meta"><span class="pill soon">${relDay(x.nd)}</span><span>${describe(x.c.sched)}</span></div>
      </div>
      <button class="iconbtn" data-toggle="${esc(x.c.id)}" data-k="${keyOf(t0)}">${t('today.doNow')}</button>
    </div>`).join('')}</section>`;
}

function renderToday(idx) {
  if (!state.chores.length) {
    return `<div class="empty">${t('today.noHabits')}<br><br><button class="btn" data-add>${t('today.addFirst')}</button></div>`;
  }
  const tk = keyOf(today());
  const items = todayItems(idx);
  if (!items.length) return `<div class="empty">${t('today.nothingDue')}</div>` + upcoming(idx);

  let html = '';
  for (const slot of SLOT_KEYS) {
    const group = items
      .filter((x) => (x.c.slot || 'any') === slot)
      .sort((a, b) => (a.st.done - b.st.done) || ((b.st.lateDays || 0) - (a.st.lateDays || 0)));
    if (!group.length) continue;
    const d = group.filter((x) => x.st.done).length;
    html += `<section class="group"><h2>${t('slots.' + slot)} <small>${d}/${group.length}</small></h2>${group.map((x) => choreRow(x.c, x.st, tk)).join('')}</section>`;
  }
  return html + upcoming(idx);
}

/* ---------- week ---------- */

function heatmap() {
  const t0 = today();
  const days = 45;
  const count = (d) => (state.done[keyOf(d)] || []).length;

  const counts = [];
  let max = 1, total = 0, active = 0;
  for (let i = days - 1; i >= 0; i--) {
    const n = count(addDays(t0, -i));
    counts.push(n);
    max = Math.max(max, n);
    total += n;
    if (n) active++;
  }

  // Streak of consecutive active days; today not counting yet doesn't break it.
  let streak = 0;
  for (let i = 0; i <= 400; i++) {
    if (count(addDays(t0, -i))) streak++;
    else if (i > 0) break;
  }

  const cells = counts.map((n, i) => {
    const d = addDays(t0, -(days - 1 - i));
    const pct = n ? 25 + Math.round((75 * n) / max) : 0;
    const style = n ? `background:color-mix(in srgb,var(--ok) ${pct}%,var(--line))` : '';
    return `<div title="${esc(t('week.cellTitle', { date: fmtShort(d), n }))}" style="${style}"></div>`;
  }).join('');

  return `<div class="panel" style="margin-top:6px"><h3>${t('week.last45')}</h3><div class="heat">${cells}</div>
    <div class="stats"><div><b>${total}</b>${t('week.choresDone')}</div><div><b>${active}</b>${t('week.activeDays')}</div><div><b>${streak}</b>${t('week.streak')}</div></div></div>`;
}

function renderWeek(idx) {
  const t0 = today();
  const start = addDays(t0, ui.weekOffset * 7);
  const end = addDays(start, 6);

  let html = `<div class="weeknav">
    <button class="iconbtn" data-week="-1" aria-label="${t('week.prevLabel')}">${t('week.prev')}</button>
    <strong>${ui.weekOffset === 0 ? t('week.next7') : `${fmtShort(start)} – ${fmtShort(end)}`}</strong>
    <button class="iconbtn" data-week="1" aria-label="${t('week.nextLabel')}">${t('week.next')}</button></div><div class="week">`;

  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const k = keyOf(d);
    const future = d > t0;
    const list = state.chores.filter((c) => isDoneOn(state.done, c.id, k) || plannedOn(c, idx, state.done, d));

    html += `<div class="day${k === keyOf(t0) ? ' today' : ''}"><div class="dl">${weekdayShort(d.getDay())}<span>${fmtDayMonth(d)}</span></div><div class="chips">`;
    if (!list.length) html += `<span class="none">${t('week.freeDay')}</span>`;
    for (const c of list) {
      const name = choreName(c);
      const dn = isDoneOn(state.done, c.id, k);
      const action = future ? `disabled title="${t('week.upcoming')}"` : `data-toggle="${esc(c.id)}" data-k="${k}"`;
      const label = dn ? `${name} ${t('week.doneSuffix')}` : name;
      html += `<button class="chip${dn ? ' done' : ''}" style="--c:${areaColor(c.area)}" ${action} aria-label="${esc(label)}"><i></i><span class="t">${esc(name)}</span></button>`;
    }
    html += `</div></div>`;
  }
  return html + `</div>` + heatmap();
}

/* ---------- habits ---------- */

function renderHabits(idx) {
  const t0 = today();
  const n = state.chores.length;
  let html = `<div class="toolbar"><span class="sub">${t('habits.count', { n })}</span><button class="btn" data-add>${t('habits.add')}</button></div>`;
  if (!n) return html + `<div class="empty">${t('habits.empty')}</div>`;

  html += '<div class="group">';
  for (const c of state.chores) {
    const ld = lastDoneOnOrBefore(c, idx, t0);
    const nd = nextDue(c, idx, state.done);
    html += `<div class="row">${glyph(c)}
      <div class="info"><div class="name">${esc(choreName(c))}</div>
        <div class="meta"><span>${describe(c.sched)}</span><span>${t('slots.' + (c.slot || 'any'))}</span></div>
        <div class="meta"><span>${t('habits.last', { when: ld ? relDay(ld) : t('habits.never') })}</span>${nd ? `<span>${t('habits.next', { when: relDay(nd) })}</span>` : ''}</div>
      </div>
      <button class="iconbtn" data-edit="${esc(c.id)}">${t('habits.edit')}</button></div>`;
  }
  return html + '</div>';
}

/* ---------- entry ---------- */

const VIEWS = { today: renderToday, week: renderWeek, habits: renderHabits };

export function render() {
  if (!state) return;
  const idx = buildDoneIndex(state.done);
  renderHeader(idx);
  for (const b of document.querySelectorAll('.tabs button')) {
    b.setAttribute('aria-selected', String(b.dataset.view === ui.view));
  }
  $('view').innerHTML = `<div class="group" style="gap:14px">${VIEWS[ui.view](idx)}</div>`;
}
