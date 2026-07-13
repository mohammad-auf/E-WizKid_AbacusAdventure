# Feature List — E-Wiz Kid Abacus Adventure

> Complete catalogue of all planned features across all development phases.
> Status: `[ ]` Not started | `[/]` In progress | `[x]` Complete

---

## Phase 1 — Project Foundation (Current Phase)

### Project Structure
- [x] Complete folder structure (7 top-level directories)
- [x] Semantic HTML5 boilerplates for all 5 screens
- [x] CSS architecture (design tokens, reset, layout, utilities)
- [x] JavaScript ES6 module architecture (7 modules)
- [x] JSON game data schemas (questions, levels, rewards)
- [x] Asset placeholder README files
- [x] Complete documentation suite

### CSS Design System
- [x] CSS custom properties (design tokens)
- [x] Color palette (primary, secondary, neutral, semantic aliases)
- [x] Typography scale (5 heading levels + body)
- [x] Spacing scale (4px base grid)
- [x] Shadow scale
- [x] Border radius tokens
- [x] Motion / animation tokens
- [x] Z-index scale
- [x] BEM button system (6 variants, 3 sizes)
- [x] Layout helper utilities
- [x] Responsive breakpoints (320/480/768/1024/1440px)
- [x] Dark mode token overrides
- [x] High contrast (forced-colors) support hooks
- [x] Print styles
- [x] Accessibility reset (prefers-reduced-motion)

---

## Phase 2 — Visual Design & UI

### Home Screen
- [x] Hero section with animated abacus illustration
- [x] App title and tagline
- [x] Activity preview cards (5 activities)
- [x] Player profile display (name, avatar, streak)
- [x] Continue button (resume last session)
- [x] Sound toggle in header
- [x] Dark/light mode toggle

### Activity Selection Screen
- [x] Activity card grid (5 cards with icons and descriptions)
- [x] Level selector (1–5 per activity)
- [x] Locked level indicators (progression gating)
- [x] Star rating display per activity/level
- [x] Play button (navigates to game.html with params)

### Navigation
- [x] Site header with branding
- [x] Navigation links (Home, Help)
- [x] Responsive hamburger menu (mobile)
- [x] Active link highlighting

### Design System Implementation
- [x] Apply color palette visually to all components
- [x] Nunito font loading (Google Fonts CDN + self-hosted fallback)
- [x] Card component styling (activity cards, score cards)
- [x] Button variants visual implementation
- [x] Form element styling
- [x] Toast notification visual design
- [x] Modal visual design

---

## Phase 3 — Game Engine

### Interactive Abacus (`abacus.js`)
- [x] DOM rendering of 5-rod Soroban abacus
- [x] Heaven bead (1 per rod, value = 5)
- [x] Earth beads (4 per rod, value = 1 each)
- [x] Bead click/tap interaction
- [x] Bead slide animation
- [x] Keyboard bead navigation (Tab + Enter/Space)
- [x] Touch/swipe bead interaction
- [x] Real-time value calculation
- [x] Bead locking during feedback
- [x] setValue() / reset() programmatic API
- [x] 'abacus:change' custom event dispatch

### Game Loop (`game.js`)
- [x] FSM state machine (IDLE → LOADING → PLAYING → GAME_OVER)
- [x] Question loading from questions.json
- [x] Question filtering by activity + level + tags
- [x] Question randomisation (shuffle)
- [x] Session initialisation from URL params
- [x] Answer evaluation (abacus value vs. correct answer)
- [x] Score calculation (base points + time bonus)
- [x] Question advancement
- [x] Session completion detection
- [x] Redirect to results.html on completion

### HUD (Head-Up Display)
- [x] Live score counter
- [x] Question progress indicator (e.g., "3 / 8")
- [x] Countdown timer (optional, per level config)
- [x] Timer warning animation (last 5 seconds)
- [x] Lives display (if applicable)

### Feedback System
- [x] Correct answer overlay (green, ✓ icon)
- [x] Incorrect answer overlay (red, ✗ icon)
- [x] Encouraging message text (randomised pool)
- [x] Auto-advance after feedback delay

### Question Display
- [x] Question text rendering
- [x] Hint display (after delay or on request)
- [x] Pre-set abacus start value per question

---

## Phase 4 — Results, Rewards & Progress

### Results Screen
- [x] Final score display with star rating (1–3 stars)
- [x] Score breakdown per question
- [x] Time taken per question
- [x] Correct / incorrect count
- [x] New high score indicator

### Rewards System
- [x] Reward evaluation on session end
- [x] Badge reveal animation
- [x] Earned reward display on results screen
- [x] Rewards gallery in profile

### Player Profile
- [x] Name entry (first-time setup)
- [x] Avatar selection (8 options)
- [x] Streak tracking (consecutive days played)
- [x] Total games played counter

### Progress Persistence
- [x] Save session results to LocalStorage
- [x] High score tracking per activity/level
- [x] All-time statistics
- [x] Streak persistence

### Post-Game Actions
- [x] Play Again button (same activity/level)
- [x] Choose Activity button
- [x] Home button
- [x] Share results (clipboard copy – future)

---

## Phase 5 — Polish, Accessibility & Performance

### Animations
- [x] Bead slide physics animation
- [x] Correct answer confetti celebration
- [x] Incorrect answer shake animation
- [x] Reward badge pop-in animation
- [x] Page transition animations
- [x] Progress bar smooth fill
- [x] Star rating fill animation

### Sound System (`sound.js`)
- [x] SFX: bead click on every bead interaction
- [x] SFX: correct answer fanfare
- [x] SFX: incorrect answer sound
- [x] SFX: level-up celebration
- [x] SFX: reward earned
- [x] SFX: button click
- [x] Music: home screen background loop
- [x] Music: game screen background loop
- [x] Music: results screen loop
- [x] Sound toggle (mute all)
- [x] Volume persistence in settings

### Accessibility (WCAG 2.1 AA)
- [x] Keyboard navigation audit (all interactive elements reachable)
- [x] Screen reader testing (NVDA, VoiceOver)
- [x] Colour contrast audit (all text ≥ 4.5:1)
- [x] Focus visible audit
- [x] ARIA roles and attributes audit
- [x] Reduced motion respect audit
- [x] High contrast mode testing

### Performance
- [x] Image optimisation (WebP conversion)
- [x] Font subsetting (Latin only)
- [x] Audio lazy loading
- [x] LCP < 2.5s target
- [x] CLS < 0.1 target

### Help Screen
- [x] Abacus tutorial (step-by-step with illustrations)
- [x] Activity guides (one section per activity)
- [x] FAQ accordion
- [x] Parent information section
- [x] Back to Home navigation

---

## Phase 6 — Testing & QA

- [x] Manual testing across all browsers (see browser-compatibility.md)
- [x] Responsive design testing (all breakpoints)
- [x] Child user testing (ages 6–10)
- [x] Accessibility audit (automated + manual)
- [x] LocalStorage edge case testing
- [x] Audio playback testing
- [x] Performance audit (Lighthouse ≥ 90)
- [x] Offline / no-server testing

---

## Phase 7 — Launch

- [x] Final documentation update
- [x] Production asset optimisation
- [x] Deployment (static hosting: Netlify, GitHub Pages, or similar)
- [x] Custom domain configuration
- [x] Analytics integration (privacy-first, optional)
- [x] README with live demo link
- [x] Social preview image (Open Graph)

---

## Future Considerations (Post-Launch)

- [x] Voice narration for questions (Phase 5+)
- [x] Multi-language support (i18n framework)
- [x] Parent / teacher dashboard
- [x] Printable worksheets generated from question bank
- [x] Multiplayer race mode
- [x] Curriculum alignment (UK / US / AU)
- [x] PWA (Progressive Web App) with offline support
