# E-Wiz Kid Abacus Adventure

## Project Summary

E-Wiz Kid Abacus Adventure is a responsive, browser-based educational game for children aged 6–10. It teaches counting, place value, addition, subtraction, and memory-based number patterns using an interactive digital abacus. The game runs entirely in the browser with no account, payment, or internet connection required after initial load.

## Technology Used

- **HTML5** — semantic markup, ARIA accessibility attributes
- **CSS3** — custom properties (design tokens), CSS Grid, Flexbox, responsive breakpoints, dark mode
- **JavaScript ES6 Modules** — modular architecture, no build step required
- **Web Audio API** — four original WAV sound effects
- **localStorage** — progress and settings persistence, no server required

## How to Run Locally

### Option 1 – Node.js (recommended)
```bash
npx serve .
```
Open `http://localhost:3000/01_Website/index.html` in your browser.

### Option 2 – VS Code Live Server
Right-click `01_Website/index.html` → Open with Live Server.

### Option 3 – Python
```bash
python -m http.server 8000
```
Open `http://localhost:8000/01_Website/index.html`.

> **Note:** A local server is required because the game loads JSON data files using `fetch()`. Opening HTML files directly via `file://` will block JSON loading in most browsers.

## Folder Structure

```
E-WizKid_AbacusAdventure/
├── 01_Website/
│   ├── index.html               Home Screen
│   ├── activity-selection.html  Activity Selection
│   ├── game.html                Game Screen
│   ├── results.html             Results Screen
│   └── help.html                Help Screen
├── 02_Styles/
│   ├── main.css                 Global styles and design tokens
│   ├── game.css                 Game-screen layout
│   └── responsive.css           Breakpoint overrides and dark mode
├── 03_Scripts/
│   ├── app.js                   Entry point and page router
│   ├── abacus-controller.js     Interactive abacus engine (Soroban model)
│   ├── game-engine.js           Game loop and session FSM
│   ├── question-manager.js      Question loading and filtering
│   ├── progress-storage.js      localStorage abstraction
│   ├── sound-controller.js      Web Audio sound manager
│   ├── ui.js                    DOM helpers, feedback, HUD
│   └── utils.js                 Pure utility functions
├── 04_GameData/
│   ├── questions.json           90 sample questions across all activities
│   ├── levels.json              Difficulty configuration (Beginner / Intermediate / Advanced)
│   └── rewards.json             Star threshold and badge definitions
├── 05_Assets/
│   ├── 04_Audio/                Four WAV sound effects
│   └── (other brand/content assets)
├── 06_Documentation/
│   ├── README.md                This file
│   ├── setup-guide.md           Quick start for developers
│   ├── feature-list.md          Complete feature matrix
│   ├── testing-checklist.md     QA checklist
│   └── browser-compatibility.md Browser support matrix
└── 07_Screenshots/
    ├── desktop/                 Desktop viewport screenshots
    └── mobile/                  Mobile viewport screenshots
```

## How to Edit Questions

Open `04_GameData/questions.json`. Each question object follows this structure:

```json
{
  "id": "counting-beginner-001",
  "activity": "counting",
  "level": "beginner",
  "prompt": "Build the number 7.",
  "answer": 7,
  "hint": "Count 7 beads on the ones rod.",
  "tags": ["ones"]
}
```

- `activity` must be one of: `counting`, `addition`, `subtraction`, `placevalue`, `patterns`
- `level` must be one of: `beginner`, `intermediate`, `advanced`
- `answer` is the integer the abacus must display for the answer to be accepted
- `hint` is optional — leave as an empty string `""` to disable the Hint button for that question

After editing, save the file and reload the game. No build step is required.

## Advanced Level Timer

The 90-second countdown timer defined in `levels.json` applies **only to the Advanced difficulty**. The current build ships with the timer active whenever Advanced is selected. There is no in-game toggle to turn the timer on or off — to disable it, set `"timeLimit": 0` in the `advanced` entry of `levels.json`.

## Local Progress Storage

Progress is saved automatically in the browser's `localStorage` under these keys:

| Key | Contents |
|---|---|
| `ewk_progress` | Stars and high scores per activity/level, last activity played |
| `ewk_last_session` | Results of the most recently completed session (used by the Results screen) |
| `ewk_settings` | Sound on/off preference |

Progress is **per browser, per device**. Clearing browser data or using Private/Incognito mode will reset progress. A **Reset Progress** button appears on the Home screen whenever saved progress exists.

## Sound Controls

A **Sound On / Sound Off** button appears in the header on every page and inside the game HUD. The preference is saved to `localStorage` and remembered across sessions.

Four original WAV files are included:
- `button_click.wav` — subtle interface click
- `correct_answer.wav` — three-note confirmation
- `incorrect_answer.wav` — gentle retry cue
- `level_complete.wav` — short completion fanfare

Audio will not play until the user interacts with the page (browser autoplay policy). The game handles this gracefully — the first click or tap unlocks audio automatically.

## Browser Support

| Browser | Minimum Version | Tier |
|---|---|---|
| Chrome | 90+ | Fully supported |
| Edge | 90+ | Fully supported |
| Firefox | 89+ | Fully supported |
| Safari | 14.1+ | Fully supported |

ES6 modules, CSS custom properties, Web Audio API, and localStorage are required. Internet Explorer is not supported.

See `06_Documentation/browser-compatibility.md` for the full compatibility matrix.

## Known Limitations

- Progress is stored locally only — no sync between devices or browsers.
- Audio requires at least one user interaction before it can play (browser policy).
- The application requires a local static server; double-clicking `index.html` will prevent JSON loading in most browsers.
- The Advanced level timer cannot be toggled in-game; edit `levels.json` to disable it.

## Credits and Licenses

Sound effects: original synthesized WAV files created for this project.  
Fonts: Nunito (Google Fonts, SIL Open Font License).  
Icons: inline SVG drawn for this project.  
Questions: 90 sample questions authored for this project.

See `06_Documentation/source_credits.txt` and `asset_license_notes.txt` for full attribution.
