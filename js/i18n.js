// Internationalisation: locale registry, translation lookup, pluralisation and static-text binding.
//
// Add a language: create js/locales/<tag>.js (copy en-GB.js), import it below,
// and add it to LOCALES with its own-language name.

import enGB from './locales/en-GB.js';
import fiFI from './locales/fi-FI.js';
import svSE from './locales/sv-SE.js';

export const DEFAULT_LOCALE = 'en-GB';
const LOCALE_KEY = 'home-rhythm-locale';

/** Language names are shown in their own language in the picker. */
export const LOCALES = {
  'en-GB': { name: 'English (UK)', messages: enGB },
  'fi-FI': { name: 'Suomi', messages: fiFI },
  'sv-SE': { name: 'Svenska', messages: svSE },
};

let current = DEFAULT_LOCALE;
let plurals = new Intl.PluralRules(current);

export const getLocale = () => current;

export function setLocale(tag) {
  current = LOCALES[tag] ? tag : DEFAULT_LOCALE;
  plurals = new Intl.PluralRules(current);
  document.documentElement.lang = current;
  try { localStorage.setItem(LOCALE_KEY, current); } catch { /* storage blocked */ }
  applyStaticText();
}

/** Restore the saved language, falling back to en-GB. */
export function initLocale() {
  let saved = null;
  try { saved = localStorage.getItem(LOCALE_KEY); } catch { /* storage blocked */ }
  setLocale(saved || DEFAULT_LOCALE);
}

const lookup = (dict, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);

/**
 * Translate a key like "header.left". Falls back to en-GB, then to the key itself.
 * {placeholders} are filled from params; plural objects are chosen by params.n.
 */
export function t(key, params = {}) {
  let msg = lookup(LOCALES[current].messages, key);
  if (msg === undefined) msg = lookup(enGB, key);
  if (msg === undefined) return key;
  if (typeof msg === 'object') msg = msg[plurals.select(params.n ?? 0)] ?? msg.other;
  return String(msg).replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m));
}

/** Does a translation exist for this key in any locale? Used for starter-chore templates. */
export const allTranslations = (key) =>
  Object.values(LOCALES).map((l) => lookup(l.messages, key)).filter((v) => v !== undefined);

/** Fill elements marked with data-i18n (textContent) and data-i18n-aria (aria-label). */
export function applyStaticText(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
}

/** Build the language picker's options. */
export function fillLanguagePicker(select) {
  select.innerHTML = Object.entries(LOCALES)
    .map(([tag, { name }]) => `<option value="${tag}" lang="${tag}"${tag === current ? ' selected' : ''}>${name}</option>`)
    .join('');
}
