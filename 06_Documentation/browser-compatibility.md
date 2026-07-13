# Browser Compatibility — E-Wiz Kid Abacus Adventure

> This document defines the browser support matrix for the project and
> lists the web platform features used, with their compatibility status.

---

## Support Tiers

| Tier       | Definition                                              | Testing Requirement |
|------------|---------------------------------------------------------|---------------------|
| **Tier 1** | Fully supported — all features work as intended         | Manual + automated  |
| **Tier 2** | Mostly supported — minor visual differences acceptable  | Manual testing       |
| **Tier 3** | Not officially supported — graceful degradation only    | Best-effort          |

---

## Tier 1 — Fully Supported Browsers

| Browser             | Platform        | Minimum Version | Release Date    |
|---------------------|-----------------|-----------------|-----------------|
| **Google Chrome**   | Desktop + Android | 90+           | April 2021      |
| **Microsoft Edge**  | Desktop + Android | 90+           | April 2021      |
| **Mozilla Firefox** | Desktop + Android | 89+           | June 2021       |
| **Apple Safari**    | macOS + iOS     | 14.1+           | April 2021      |

> All Tier 1 browsers fully support ES6 Modules, CSS Custom Properties,
> Web Audio API, LocalStorage, and CSS Grid.

---

## Tier 2 — Mostly Supported

| Browser             | Platform  | Notes                                                      |
|---------------------|-----------|------------------------------------------------------------|
| **Samsung Internet**| Android   | v14+ required. CSS Custom Properties fully supported.      |
| **Firefox ESR**     | Desktop   | ESR 91+ supported. Some newer CSS features may not apply.  |
| **Opera**           | Desktop   | Based on Chromium — functionally identical to Chrome.      |

---

## Tier 3 — Not Officially Supported

| Browser             | Reason                                                     |
|---------------------|------------------------------------------------------------|
| **Internet Explorer** | No ES6 module support. End-of-life (June 2022).          |
| **Chrome < 61**     | No native ES6 module support.                              |
| **Safari < 10.1**   | No ES6 module support.                                     |
| **Firefox < 60**    | No ES6 module support.                                     |

---

## Feature Support Matrix

The following features are used in the project. All must be supported in Tier 1 browsers.

### JavaScript

| Feature                        | Chrome | Edge | Firefox | Safari | Notes                          |
|--------------------------------|--------|------|---------|--------|--------------------------------|
| ES6 Modules (`type="module"`)  | ✅ 61  | ✅ 79| ✅ 60   | ✅ 10.1| Core requirement               |
| ES6 Classes                    | ✅ 49  | ✅ 12| ✅ 45   | ✅ 9   |                                |
| Arrow Functions                | ✅ 45  | ✅ 12| ✅ 22   | ✅ 10  |                                |
| Template Literals              | ✅ 41  | ✅ 12| ✅ 34   | ✅ 9   |                                |
| Destructuring                  | ✅ 49  | ✅ 14| ✅ 41   | ✅ 10  |                                |
| `const` / `let`                | ✅ 49  | ✅ 14| ✅ 44   | ✅ 10  |                                |
| Spread / Rest (`...`)          | ✅ 46  | ✅ 12| ✅ 55   | ✅ 10  |                                |
| `async` / `await`              | ✅ 55  | ✅ 15| ✅ 52   | ✅ 10.1|                                |
| `fetch()`                      | ✅ 42  | ✅ 14| ✅ 39   | ✅ 10.1|                                |
| `Promise`                      | ✅ 32  | ✅ 12| ✅ 29   | ✅ 8   |                                |
| `CustomEvent`                  | ✅ 15  | ✅ 12| ✅ 11   | ✅ 5.1 |                                |
| `localStorage`                 | ✅ 4   | ✅ 12| ✅ 3.5  | ✅ 4   |                                |
| `URLSearchParams`              | ✅ 49  | ✅ 17| ✅ 44   | ✅ 10.1|                                |
| `crypto.randomUUID()`          | ✅ 92  | ✅ 92| ✅ 95   | ✅ 15.4| Fallback provided in utils.js  |
| Web Audio API                  | ✅ 35  | ✅ 79| ✅ 25   | ✅ 6   | `webkitAudioContext` fallback  |
| `document.addEventListener`    | ✅ All | ✅ All| ✅ All | ✅ All |                                |
| `Object.freeze()`              | ✅ 6   | ✅ 12| ✅ 4    | ✅ 5.1 |                                |

### CSS

| Feature                        | Chrome | Edge | Firefox | Safari | Notes                         |
|--------------------------------|--------|------|---------|--------|-------------------------------|
| CSS Custom Properties (`:root`)| ✅ 49  | ✅ 15| ✅ 31   | ✅ 9.1 | Core design system requirement|
| CSS Grid                       | ✅ 57  | ✅ 16| ✅ 52   | ✅ 10.1|                               |
| CSS Flexbox                    | ✅ 29  | ✅ 12| ✅ 28   | ✅ 9   |                               |
| `aspect-ratio`                 | ✅ 88  | ✅ 88| ✅ 89   | ✅ 15  |                               |
| `min()` / `max()` / `clamp()`  | ✅ 79  | ✅ 79| ✅ 75   | ✅ 13.1|                               |
| `gap` (grid + flex)            | ✅ 66  | ✅ 21| ✅ 61   | ✅ 12  |                               |
| `position: sticky`             | ✅ 56  | ✅ 16| ✅ 32   | ✅ 13  |                               |
| `@media (prefers-color-scheme)`| ✅ 76  | ✅ 79| ✅ 67   | ✅ 12.1| Dark mode                     |
| `@media (prefers-reduced-motion)`| ✅ 74 | ✅ 79| ✅ 63   | ✅ 10.1|                               |
| `@media (forced-colors)`       | ✅ 89  | ✅ 79| ✅ 89   | ⚠️ N/A | Safari doesn't support yet    |
| `dvh` / `dvw` units            | ✅ 108 | ✅ 108| ✅ 110  | ✅ 15.4| Used in game layout           |
| Scroll behavior: smooth        | ✅ 61  | ✅ 79| ✅ 36   | ✅ 15.4|                               |
| `::selection`                  | ✅ All | ✅ All| ✅ All | ✅ All |                               |
| `text-size-adjust`             | ✅ 54  | ✅ 79| ✅ —    | ✅ 3   | `-webkit-` prefix for Safari  |

### HTML

| Feature                        | Chrome | Edge | Firefox | Safari | Notes                         |
|--------------------------------|--------|------|---------|--------|-------------------------------|
| Semantic elements (main, nav…) | ✅ 26  | ✅ 12| ✅ 21   | ✅ 7   |                               |
| `<dialog>` element             | ✅ 37  | ✅ 79| ✅ 98   | ✅ 15.4| Used for modals (Phase 3+)    |
| `aria-*` attributes            | ✅ All | ✅ All| ✅ All | ✅ All |                               |
| `role` attributes              | ✅ All | ✅ All| ✅ All | ✅ All |                               |
| `tabindex`                     | ✅ All | ✅ All| ✅ All | ✅ All |                               |
| `hidden` attribute             | ✅ 10  | ✅ 12| ✅ 4    | ✅ 5.1 |                               |
| `type="module"` script         | ✅ 61  | ✅ 79| ✅ 60   | ✅ 10.1|                               |

---

## Known Issues & Workarounds

| Browser         | Issue                                              | Workaround                                   |
|-----------------|----------------------------------------------------|----------------------------------------------|
| Safari < 15.4   | `dvh` / `dvw` units not supported                  | `min-height: 100vh` fallback in game layout  |
| Safari (all)    | `forced-colors` media query not supported          | Acceptable — Windows-only feature            |
| All browsers    | AudioContext requires user gesture to start        | `_unlockAudio()` listener pattern in sound.js|
| Firefox         | `text-size-adjust` requires `-moz-` prefix         | All three prefixes included in reset         |
| Private Mode    | LocalStorage may be blocked or sandboxed           | Graceful fallback in storage.js `initStorage`|

---

## Testing Tools

| Tool                   | Use Case                                     | URL                                  |
|------------------------|----------------------------------------------|--------------------------------------|
| BrowserStack           | Cross-browser / cross-OS manual testing      | https://browserstack.com             |
| Can I Use              | Feature compatibility research               | https://caniuse.com                  |
| Chrome DevTools        | Performance, Lighthouse, accessibility audit | Built into Chrome                    |
| WAVE                   | Accessibility evaluation                     | https://wave.webaim.org              |
| axe DevTools           | Automated WCAG audit (browser extension)     | https://deque.com/axe/devtools/      |
| W3C Markup Validator   | HTML validation                              | https://validator.w3.org             |
| W3C CSS Validator      | CSS validation                               | https://jigsaw.w3.org/css-validator/ |
| Lighthouse             | Performance + accessibility scoring          | Chrome DevTools → Lighthouse tab     |

---

## Mobile Device Support

| Device Category       | OS Version       | Browser              | Tier   |
|-----------------------|------------------|----------------------|--------|
| iPhone 12+            | iOS 15+          | Safari               | Tier 1 |
| iPhone X, 11          | iOS 14+          | Safari               | Tier 1 |
| iPad (any, 2021+)     | iPadOS 15+       | Safari               | Tier 1 |
| Samsung Galaxy S21+   | Android 11+      | Chrome               | Tier 1 |
| Google Pixel 5+       | Android 11+      | Chrome               | Tier 1 |
| Samsung Galaxy Tab    | Android 11+      | Samsung Internet 14+ | Tier 2 |
| Older Android (< 11)  | Android < 11     | Chrome               | Tier 2 |

---

*Last updated: Phase 6 — Production Release*
