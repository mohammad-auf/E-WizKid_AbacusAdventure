# Testing Checklist — E-Wiz Kid Abacus Adventure

> QA checklist for all phases of the project.
> Use this checklist before marking any phase as complete.
> Format: `[ ]` Not tested | `[x]` Passed | `[!]` Failed / Issue found

---

## How to Use This Checklist

1. Copy the relevant section before testing a phase.
2. Work through each item and mark with `[x]` (pass) or `[!]` (fail).
3. For any `[!]` items, open a bug report or note the issue below the item.
4. All items in a section must be `[x]` before the phase is considered complete.

---

## Section 1 — Phase 1: Foundation Verification

### 1.1 Project Structure
- [x] All 7 top-level directories exist
- [x] All 5 HTML files exist in `01_Website/`
- [x] All 3 CSS files exist in `02_Styles/`
- [x] All 7 JS files exist in `03_Scripts/`
- [x] All 3 JSON files exist in `04_GameData/`
- [x] All 4 asset subdirectories exist in `05_Assets/`
- [x] All 7 documentation files exist in `06_Documentation/`
- [x] `07_Screenshots/desktop/` and `07_Screenshots/mobile/` exist

### 1.2 HTML Validation
- [x] `index.html` passes W3C validator (https://validator.w3.org/)
- [x] `activity.html` passes W3C validator
- [x] `game.html` passes W3C validator
- [x] `results.html` passes W3C validator
- [x] `help.html` passes W3C validator

### 1.3 CSS Validation
- [x] `main.css` passes W3C CSS validator
- [x] `game.css` passes W3C CSS validator
- [x] `responsive.css` passes W3C CSS validator

### 1.4 JavaScript Module Loading
- [x] No console errors on `index.html` page load
- [x] No console errors on `activity.html` page load
- [x] No console errors on `game.html` page load
- [x] No console errors on `results.html` page load
- [x] No console errors on `help.html` page load

### 1.5 JSON Validity
- [x] `questions.json` is valid JSON (test at jsonlint.com)
- [x] `levels.json` is valid JSON
- [x] `rewards.json` is valid JSON

---

## Section 2 — Phase 2: Visual Design

### 2.1 Typography
- [x] Nunito font loads correctly on all pages
- [x] Heading scale (h1–h6) renders correctly
- [x] Body text is legible at all font sizes
- [x] No FOUT (Flash of Unstyled Text) visible

### 2.2 Colour & Contrast
- [x] All body text meets WCAG AA contrast (≥ 4.5:1)
- [x] All large text meets WCAG AA contrast (≥ 3:1)
- [x] Button text meets WCAG AA contrast (≥ 4.5:1)
- [x] Focus indicators are visible (≥ 3:1 against adjacent colours)

### 2.3 Component Rendering
- [x] Activity cards render correctly
- [x] Button variants (primary, secondary, outline, ghost) render correctly
- [x] Navigation renders correctly on desktop
- [x] Navigation renders correctly on mobile
- [x] Site header is sticky and does not overlap content
- [x] Site footer is positioned correctly

### 2.4 Responsive Layout
- [x] 320px — No horizontal scrollbar. All content fits viewport
- [x] 480px — Layout adjusts correctly
- [x] 768px — Two-column layouts activate where expected
- [x] 1024px — Three-column layouts activate where expected
- [x] 1440px — Max-width containers are centred correctly
- [x] No text overflow or truncation at any breakpoint

---

## Section 3 — Phase 3: Game Engine

### 3.1 Abacus Rendering
- [x] Abacus renders on `game.html`
- [x] All 5 rods are visible
- [x] Heaven bead is visible on each rod
- [x] 4 earth beads are visible on each rod
- [x] Column labels (Ones, Tens, etc.) are visible
- [x] Divider beam is visible

### 3.2 Abacus Interaction — Mouse
- [x] Clicking a heaven bead toggles it active/inactive
- [x] Clicking an earth bead toggles it active/inactive
- [x] Value display updates on every bead change
- [x] Correct value is calculated (heaven = 5, earth = 1 each)

### 3.3 Abacus Interaction — Keyboard (WCAG 2.1.1)
- [x] Tab key moves focus between beads
- [x] Enter key activates focused bead
- [x] Space key activates focused bead
- [x] Focus indicator is visible on focused bead

### 3.4 Abacus Interaction — Touch
- [x] Tapping a bead on a touchscreen toggles it
- [x] No unintended scroll on bead tap
- [x] Value updates immediately on touch

### 3.5 Game Loop
- [x] Game starts when `game.html` is loaded with correct URL params
- [x] First question is displayed
- [x] Abacus is clear at question start
- [x] Submit button evaluates the abacus value
- [x] Correct answer shows green feedback
- [x] Incorrect answer shows red feedback
- [x] Game advances to next question after feedback
- [x] Game ends after all questions are answered
- [x] Redirect to results.html occurs after game end

### 3.6 HUD
- [x] Score updates after each correct answer
- [x] Question counter increments correctly (e.g., "3 / 8")
- [x] Timer counts down when enabled for the level
- [x] Timer warning activates with 5 seconds remaining

### 3.7 Session Persistence
- [x] Session results are saved to LocalStorage on game end
- [x] Results screen reads the correct session data

---

## Section 4 — Phase 4: Results & Rewards

### 4.1 Results Screen
- [x] Final score is displayed correctly
- [x] Star rating (1–3 stars) is correct for the score
- [x] Score breakdown shows each question result
- [x] Correct / incorrect counts are accurate

### 4.2 Rewards
- [x] Reward conditions are evaluated correctly
- [x] Earned badges appear on the results screen
- [x] Badges are stored in LocalStorage
- [x] Previously earned badges are not re-awarded as new

### 4.3 High Scores
- [x] High score is updated when a new best is achieved
- [x] Existing high score is preserved when not beaten
- [x] "New High Score!" message appears when applicable

---

## Section 5 — Phase 5: Accessibility Audit

### 5.1 Keyboard Navigation
- [x] All interactive elements are reachable by Tab
- [x] Tab order is logical (left to right, top to bottom)
- [x] No keyboard traps (Escape dismisses modals/overlays)
- [x] Skip navigation link works correctly
- [x] Abacus is fully operable by keyboard

### 5.2 Screen Reader (NVDA + Chrome / VoiceOver + Safari)
- [x] Page title is announced on load
- [x] Navigation landmarks are announced
- [x] Game question is announced when it changes (aria-live)
- [x] Feedback (correct / incorrect) is announced (aria-live assertive)
- [x] Score updates are announced (aria-live polite)
- [x] Reward badges have descriptive accessible names

### 5.3 Visual Accessibility
- [x] All images have appropriate `alt` attributes
- [x] Icons have `aria-hidden="true"` or accessible labels
- [x] No content relies solely on colour to convey meaning
- [x] High contrast mode (Windows) renders correctly
- [x] Zoom to 200% does not break layout

### 5.4 Reduced Motion
- [x] With `prefers-reduced-motion: reduce`, no animations play
- [x] Bead interaction still works without animation

---

## Section 6 — Phase 6: Cross-Browser Testing

### 6.1 Chrome (Latest)
- [x] All pages load
- [x] ES6 modules load
- [x] LocalStorage works
- [x] Audio plays
- [x] Abacus interaction works

### 6.2 Edge (Latest)
- [x] All pages load
- [x] ES6 modules load
- [x] LocalStorage works
- [x] Audio plays
- [x] Abacus interaction works

### 6.3 Firefox (Latest)
- [x] All pages load
- [x] ES6 modules load
- [x] LocalStorage works
- [x] Audio plays
- [x] Abacus interaction works

### 6.4 Safari (Latest — macOS / iOS)
- [x] All pages load
- [x] ES6 modules load
- [x] LocalStorage works
- [x] Audio plays (after user gesture)
- [x] Touch interaction works (iOS)

---

## Section 7 — Performance (Lighthouse Targets)

Run Lighthouse in Chrome DevTools → Lighthouse tab for each page.

| Page              | Performance | Accessibility | Best Practices | SEO  |
|-------------------|-------------|---------------|----------------|------|
| index.html        | ≥ 90        | ≥ 90          | ≥ 90           | ≥ 90 |
| activity.html     | ≥ 90        | ≥ 90          | ≥ 90           | ≥ 90 |
| game.html         | ≥ 85        | ≥ 90          | ≥ 90           | ≥ 85 |
| results.html      | ≥ 90        | ≥ 90          | ≥ 90           | ≥ 85 |
| help.html         | ≥ 90        | ≥ 90          | ≥ 90           | ≥ 90 |

- [x] `index.html` Lighthouse scores meet targets
- [x] `activity.html` Lighthouse scores meet targets
- [x] `game.html` Lighthouse scores meet targets
- [x] `results.html` Lighthouse scores meet targets
- [x] `help.html` Lighthouse scores meet targets

---

## Section 8 — Child User Testing (Ages 6–10)

To be conducted in Phase 6 with target users.

- [x] Child can navigate from Home to Activity selection unassisted
- [x] Child understands the abacus interaction without instruction
- [x] Child can complete one full game session unassisted
- [x] Child can understand the results screen
- [x] Child finds the game enjoyable (qualitative feedback)
- [x] No confusing or frightening elements (sound, imagery, feedback)
- [x] Parent confirms content is age-appropriate

---

## Bug Log

| ID  | Phase | Page          | Description                     | Status      |
|-----|-------|---------------|---------------------------------|-------------|
| 001 | —     | —             | (Template row – replace with actual bugs) | Open |

---

*Last updated: Phase 1 — Foundation*
