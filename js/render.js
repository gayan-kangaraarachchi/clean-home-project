// View rendering: header progress ring and the Today / Week / Habits views.

import { AREAS, SLOTS, DOW, ICONS, CHECK_ICON, areaColor } from './constants.js';
import { keyOf, addDays, diffDays, today, fmtShort, fmtLong, relDay } from './dates.js';
import { state, ui } from './store.js';
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
    total === 0 ? 'Nothing due today' : left === 0 ? 'All done for today' : `${left} chore${left > 1 ? 's' : ''} to go`;
  $('subline').textContent =
    total === 0 ? 'Enjoy the break. Check the week ahead.'
      : left === 0 ? 'Nice work. The house thanks you.'
        : late ? `${late} carried over from earlier days.` : 'Tick them off as you go.';

  const frac = total ? done / total : 0;
  $('ringArc').setAttribute('stroke-dashoffset', (100.5 * (1 - frac)).toFixed(1));
  $('ringNum').textContent = `${done}/${total}`;
}

/* ---------- today ---------- */

function choreRow(c, st, dayKey) {
  let pill = '';
  if (st.done) pill = '<span class="pill ok">Done</span>';
  else if (st.lateDays > 0) pill = `<span class="pill late">${st.lateDays === 1 ? 'From yesterday' : st.lateDays + ' days late'}</span>`;

  return `<div class="row${st.done ? ' done' : ''}">
    <button class="check" data-toggle="${esc(c.id)}" data-k="${dayKey}" aria-label="${st.done ? 'Mark not done' : 'Mark done'}: ${esc(c.name)}">${CHECK_ICON}</button>
    ${glyph(c)}
    <div class="info">
      <div class="name">${esc(c.name)}</div>
      <div class="meta"><span>${AREAS[c.area] || 'Other'}</span><span>${describe(c.sched)}</span>${pill}</div>
      ${c.note ? `<div class="meta">${esc(c.note)}</div>` : ''}
    </div>
  </div>`;
}

function upcoming(idx) {
  const t = today();
  const soon = state.chores
    .map((c) => ({ c, st: statusToday(c, idx, state.done), nd: nextDue(c, idx, state.done) }))
    .filter((x) => !x.st.show && x.nd && diffDays(x.nd, t) > 0 && diffDays(x.nd, t) <= 3)
    .sort((a, b) => a.nd - b.nd);
  if (!soon.length) return '';

  return `<section class="group"><h2>Coming up</h2>${soon.map((x) => `
    <div class="row">${glyph(x.c)}
      <div class="info"><div class="name">${esc(x.c.name)}</div>
        <div class="meta"><span class="pill soon">${relDay(x.nd)}</span><span>${describe(x.c.sched)}</span></div>
      </div>
      <button class="iconbtn" data-toggle="${esc(x.c.id)}" data-k="${keyOf(t)}">Do now</button>
    </div>`).join('')}</section>`;
}

function renderToday(idx) {
  if (!state.chores.length) {
    return `<div class="empty">No habits yet.<br><br><button class="btn" data-add>Add your first chore</button></div>`;
  }
  const tk = keyOf(today());
  const items = todayItems(idx);
  if (!items.length) return `<div class="empty">Nothing due today.</div>` + upcoming(idx);

  let html = '';
  for (const slot of Object.keys(SLOTS)) {
    const group = items
      .filter((x) => (x.c.slot || 'any') === slot)
      .sort((a, b) => (a.st.done - b.st.done) || ((b.st.lateDays || 0) - (a.st.lateDays || 0)));
    if (!group.length) continue;
    const d = group.filter((x) => x.st.done).length;
    html += `<section class="group"><h2>${SLOTS[slot]} <small>${d}/${group.length}</small></h2>${group.map((x) => choreRow(x.c, x.st, tk)).join('')}</section>`;
  }
  return html + upcoming(idx);
}

/* ---------- week ---------- */

function heatmap() {
  const t = today();
  const days = 45;
  const count = (d) => (state.done[keyOf(d)] || []).length;

  const counts = [];
  let max = 1, total = 0, active = 0;
  for (let i = days - 1; i >= 0; i--) {
    const n = count(addDays(t, -i));
    counts.push(n);
    max = Math.max(max, n);
    total += n;
    if (n) active++;
  }

  // Streak of consecutive active days; today not counting yet doesn't break it.
  let streak = 0;
  for (let i = 0; i <= 400; i++) {
    if (count(addDays(t, -i))) streak++;
    else if (i > 0) break;
  }

  const cells = counts.map((n, i) => {
    const d = addDays(t, -(days - 1 - i));
    const pct = n ? 25 + Math.round((75 * n) / max) : 0;
    const style = n ? `background:color-mix(in srgb,var(--ok) ${pct}%,var(--line))` : '';
    return `<div title="${fmtShort(d)}: ${n} done" style="${style}"></div>`;
  }).join('');

  return `<div class="panel" style="margin-top:6px"><h3>Last 45 days</h3><div class="heat">${cells}</div>
    <div class="stats"><div><b>${total}</b>chores done</div><div><b>${active}</b>active days</div><div><b>${streak}</b>day streak</div></div></div>`;
}

function renderWeek(idx) {
  const t = today();
  const start = addDays(t, ui.weekOffset * 7);
  const end = addDays(start, 6);

  let html = `<div class="weeknav">
    <button class="iconbtn" data-week="-1" aria-label="Previous 7 days">← Prev</button>
    <strong>${ui.weekOffset === 0 ? 'Next 7 days' : `${fmtShort(start)} – ${fmtShort(end)}`}</strong>
    <button class="iconbtn" data-week="1" aria-label="Next 7 days">Next →</button></div><div class="week">`;

  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const k = keyOf(d);
    const future = d > t;
    const list = state.chores.filter((c) => isDoneOn(state.done, c.id, k) || plannedOn(c, idx, state.done, d));

    html += `<div class="day${k === keyOf(t) ? ' today' : ''}"><div class="dl">${DOW[d.getDay()]}<span>${d.getDate()}.${d.getMonth() + 1}.</span></div><div class="chips">`;
    if (!list.length) html += `<span class="none">Free day</span>`;
    for (const c of list) {
      const dn = isDoneOn(state.done, c.id, k);
      const action = future ? 'disabled title="Upcoming"' : `data-toggle="${esc(c.id)}" data-k="${k}"`;
      html += `<button class="chip${dn ? ' done' : ''}" style="--c:${areaColor(c.area)}" ${action} aria-label="${esc(c.name)}${dn ? ' (done)' : ''}"><i></i><span class="t">${esc(c.name)}</span></button>`;
    }
    html += `</div></div>`;
  }
  return html + `</div>` + heatmap();
}

/* ---------- habits ---------- */

function renderHabits(idx) {
  const t = today();
  const n = state.chores.length;
  let html = `<div class="toolbar"><span class="sub">${n} habit${n === 1 ? '' : 's'}</span><button class="btn" data-add>+ Add habit</button></div>`;
  if (!n) return html + `<div class="empty">Add chores like cleaning the bathroom or checking the garbage, and choose how often they repeat.</div>`;

  html += '<div class="group">';
  for (const c of state.chores) {
    const ld = lastDoneOnOrBefore(c, idx, t);
    const nd = nextDue(c, idx, state.done);
    html += `<div class="row">${glyph(c)}
      <div class="info"><div class="name">${esc(c.name)}</div>
        <div class="meta"><span>${describe(c.sched)}</span><span>${SLOTS[c.slot || 'any']}</span></div>
        <div class="meta"><span>Last: ${ld ? relDay(ld) : 'never'}</span>${nd ? `<span>Next: ${relDay(nd)}</span>` : ''}</div>
      </div>
      <button class="iconbtn" data-edit="${esc(c.id)}">Edit</button></div>`;
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
