/**
 * @file utils.js
 * @module Utils
 * @description
 *   E-Wiz Kid Abacus Adventure – Shared Utility Functions.
 *
 *   Pure, stateless helper functions used across all other modules.
 *   This module has NO imports from other project modules to prevent
 *   circular dependencies. It may import from browser APIs only.
 *
 *   Utility Categories:
 *   ─────────────────────────────────────────────────────────────
 *   1. DOM:       Element querying, creation, attribute helpers.
 *   2. String:    Formatting, sanitisation, truncation.
 *   3. Number:    Clamping, padding, random, rounding.
 *   4. Array:     Shuffle, chunk, unique.
 *   5. Object:    Deep clone, merge.
 *   6. Time:      Debounce, throttle, formatDuration.
 *   7. Routing:   Page detection from URL.
 *   8. Validation:Type guards and range checks.
 *   9. UUID:      Simple unique ID generation.
 *
 * @author    E-Wiz Kid Abacus Adventure Team
 * @version   1.0.0
 * @since     Phase 1
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   SECTION 1 – DOM UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * $()
 * ───
 * Shorthand for document.querySelector().
 *
 * @param {string}      selector  - CSS selector.
 * @param {Element|Document} [scope=document] - Search scope.
 * @returns {Element|null}
 *
 * @example
 * const btn = $('#submit-btn');
 */
function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * $$()
 * ────
 * Shorthand for document.querySelectorAll() — returns an Array.
 *
 * @param {string}      selector  - CSS selector.
 * @param {Element|Document} [scope=document] - Search scope.
 * @returns {Element[]}
 *
 * @example
 * const cards = $$('.activity-card');
 */
function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * createElement()
 * ───────────────
 * Create a DOM element with attributes, classes, and text content
 * in a single call.
 *
 * @param {string}  tag              - HTML tag name.
 * @param {Object}  [options={}]     - Element configuration.
 * @param {string[]} [options.classes] - CSS classes to add.
 * @param {Object}  [options.attrs]  - Attributes to set.
 * @param {string}  [options.text]   - textContent to set.
 * @param {string}  [options.html]   - innerHTML to set (use cautiously).
 * @returns {HTMLElement}
 *
 * @example
 * const btn = createElement('button', {
 *   classes: ['btn', 'btn--primary'],
 *   attrs:   { type: 'button', 'aria-label': 'Submit' },
 *   text:    'Submit',
 * });
 */
function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.classes?.length) {
    el.classList.add(...options.classes);
  }

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }

  if (options.text !== undefined) {
    el.textContent = options.text;
  } else if (options.html !== undefined) {
    el.innerHTML = options.html;
  }

  return el;
}

/**
 * removeAllChildren()
 * ───────────────────
 * Remove all child nodes from a DOM element.
 * More performant than setting innerHTML = ''.
 *
 * @param {Element} el - The element to empty.
 * @returns {void}
 */
function removeAllChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 2 – STRING UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * capitalise()
 * ────────────
 * Capitalise the first character of a string.
 *
 * @param {string} str
 * @returns {string}
 *
 * @example capitalise('hello') → 'Hello'
 */
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * truncate()
 * ──────────
 * Truncate a string to the specified length, appending '…' if cut.
 *
 * @param {string} str    - The string to truncate.
 * @param {number} maxLen - Maximum character length.
 * @returns {string}
 */
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * sanitiseHTML()
 * ──────────────
 * Escape special HTML characters to prevent XSS when inserting
 * user-provided text into the DOM via innerHTML.
 * Prefer textContent over innerHTML when possible.
 *
 * @param {string} str - Raw string to sanitise.
 * @returns {string} HTML-safe string.
 */
function sanitiseHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ══════════════════════════════════════════════════════════════
   SECTION 3 – NUMBER UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * clamp()
 * ───────
 * Clamp a number within [min, max].
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 *
 * @example clamp(15, 0, 10) → 10
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * padStart()
 * ──────────
 * Pad a number with leading zeros to a given width.
 *
 * @param {number} num   - Number to pad.
 * @param {number} width - Desired string length.
 * @returns {string}
 *
 * @example padStart(7, 3) → '007'
 */
function padStart(num, width) {
  return String(num).padStart(width, '0');
}

/**
 * randomInt()
 * ───────────
 * Return a random integer in the range [min, max] (inclusive).
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * roundTo()
 * ─────────
 * Round a number to the specified number of decimal places.
 *
 * @param {number} value     - Number to round.
 * @param {number} [places=0] - Decimal places.
 * @returns {number}
 *
 * @example roundTo(3.14159, 2) → 3.14
 */
function roundTo(value, places = 0) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 4 – ARRAY UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * shuffle()
 * ─────────
 * Return a new array with elements in random order (Fisher-Yates).
 * Does NOT mutate the original array.
 *
 * @template T
 * @param {T[]} arr - Array to shuffle.
 * @returns {T[]} New shuffled array.
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * chunk()
 * ───────
 * Split an array into chunks of a given size.
 *
 * @template T
 * @param {T[]}   arr  - Array to chunk.
 * @param {number} size - Chunk size.
 * @returns {T[][]}
 *
 * @example chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * unique()
 * ────────
 * Return a new array with duplicate values removed.
 *
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function unique(arr) {
  return [...new Set(arr)];
}

/* ══════════════════════════════════════════════════════════════
   SECTION 5 – OBJECT UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * deepClone()
 * ───────────
 * Create a deep copy of a JSON-serialisable object.
 * Not suitable for objects containing functions or DOM nodes.
 *
 * @template T
 * @param {T} obj - Object to clone.
 * @returns {T}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * pick()
 * ──────
 * Return a new object containing only the specified keys.
 *
 * @template T
 * @param {T}        obj  - Source object.
 * @param {(keyof T)[]} keys - Keys to pick.
 * @returns {Partial<T>}
 */
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 – TIME / ASYNC UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * debounce()
 * ──────────
 * Return a debounced version of the given function.
 * The function fires after `wait` ms of inactivity.
 *
 * @param {Function} fn   - Function to debounce.
 * @param {number}   wait - Milliseconds to wait.
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * throttle()
 * ──────────
 * Return a throttled version of the given function.
 * The function fires at most once per `limit` ms.
 *
 * @param {Function} fn    - Function to throttle.
 * @param {number}   limit - Minimum ms between calls.
 * @returns {Function}
 */
function throttle(fn, limit) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * sleep()
 * ───────
 * Delay execution for a given number of milliseconds.
 * Use with `await` inside async functions.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 *
 * @example await sleep(500); // pause for 500ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * formatDuration()
 * ────────────────
 * Format a duration in milliseconds as "MM:SS".
 *
 * @param {number} ms - Duration in milliseconds.
 * @returns {string}
 *
 * @example formatDuration(75000) → '01:15'
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${padStart(minutes, 2)}:${padStart(seconds, 2)}`;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 – ROUTING / PAGE UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * getPageId()
 * ───────────
 * Determine the current page identifier from the URL pathname.
 * Matched against the PAGE_REGISTRY in app.js.
 *
 * Maps:
 *   /index.html  or /  → 'home'
 *   /activity-selection.html     → 'activity'
 *   /game.html         → 'game'
 *   /results.html      → 'results'
 *   /help.html         → 'help'
 *
 * @returns {string} Page identifier.
 */
function getPageId() {
  const path = window.location.pathname.toLowerCase();

  if (path.endsWith('activity-selection.html')) return 'activity';
  if (path.endsWith('game.html'))     return 'game';
  if (path.endsWith('results.html'))  return 'results';
  if (path.endsWith('help.html'))     return 'help';

  return 'home'; // Default: index.html or root
}

/**
 * getQueryParam()
 * ───────────────
 * Safely retrieve a URL query parameter value.
 *
 * @param {string} name          - Parameter name.
 * @param {string} [fallback=''] - Default value if not present.
 * @returns {string}
 *
 * @example
 * // URL: game.html?activity=counting&level=2
 * getQueryParam('activity') → 'counting'
 * getQueryParam('missing')  → ''
 */
function getQueryParam(name, fallback = '') {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) ?? fallback;
}

/**
 * navigateTo()
 * ────────────
 * Navigate to a page with optional query parameters.
 *
 * @param {string} path            - Relative page path (e.g., 'game.html').
 * @param {Object} [params={}]     - Query parameters to append.
 * @returns {void}
 *
 * @example navigateTo('game.html', { activity: 'counting', level: 1 });
 */
function navigateTo(path, params = {}) {
  const query  = new URLSearchParams(params).toString();
  const url    = query ? `${path}?${query}` : path;
  window.location.href = url;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 – VALIDATION UTILITIES
   ══════════════════════════════════════════════════════════════ */

/**
 * isNumber()
 * ──────────
 * Check if a value is a finite number.
 *
 * @param {*} val
 * @returns {boolean}
 */
function isNumber(val) {
  return typeof val === 'number' && Number.isFinite(val);
}

/**
 * isNonEmptyString()
 * ──────────────────
 * Check if a value is a non-empty string.
 *
 * @param {*} val
 * @returns {boolean}
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * isInRange()
 * ───────────
 * Check if a number is within [min, max] inclusive.
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function isInRange(val, min, max) {
  return isNumber(val) && val >= min && val <= max;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 9 – UUID UTILITY
   ══════════════════════════════════════════════════════════════ */

/**
 * generateUUID()
 * ──────────────
 * Generate a RFC 4122 v4 UUID.
 * Uses crypto.randomUUID() when available (modern browsers),
 * falling back to a manual implementation.
 *
 * @returns {string} UUID string.
 *
 * @example generateUUID() → 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: manual v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ── Public Exports ──────────────────────────────────────────── */
export {
  // DOM
  $,
  $$,
  createElement,
  removeAllChildren,
  // String
  capitalise,
  truncate,
  sanitiseHTML,
  // Number
  clamp,
  padStart,
  randomInt,
  roundTo,
  // Array
  shuffle,
  chunk,
  unique,
  // Object
  deepClone,
  pick,
  // Time / Async
  debounce,
  throttle,
  sleep,
  formatDuration,
  // Routing
  getPageId,
  getQueryParam,
  navigateTo,
  // Validation
  isNumber,
  isNonEmptyString,
  isInRange,
  // UUID
  generateUUID,
};
