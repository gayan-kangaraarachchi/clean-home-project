// Static configuration: storage keys, area and time-of-day keys, and inline SVG icons.
// Display labels live in js/locales/*.js (areas.*, slots.*).

export const STORAGE_KEY = 'home-rhythm-v1';
export const VIEW_KEY = 'home-rhythm-v1-view';
export const HISTORY_DAYS = 400; // completion history kept in storage

export const AREA_KEYS = ['bathroom', 'laundry', 'floors', 'waste', 'kitchen', 'other'];
export const SLOT_KEYS = ['morning', 'afternoon', 'evening', 'any'];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first (0 = Sunday)

export const areaColor = (area) => `var(--a-${area === 'bathroom' ? 'bath' : area})`;

const svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  bathroom: svg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
  laundry: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M7.5 6.5h.01M10.5 6.5h3"/>'),
  floors: svg('<path d="M14 3l-3 9"/><path d="M6 14h10l2 7H4z"/><path d="M8 17v4M12 17v4M16 17v4"/>'),
  waste: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>'),
  kitchen: svg('<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v6M9 3v6M17 21V3c-2 1-3 4-3 8h3"/>'),
  other: svg('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
};

export const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
