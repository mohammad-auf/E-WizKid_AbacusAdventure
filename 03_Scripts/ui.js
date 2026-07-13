/**
 * @file ui.js
 * @module UI
 * @description
 *   E-Wiz Kid Abacus Adventure – UI Manager (Phase 3 complete).
 *
 *   Handles all DOM manipulation not owned by abacus.js or game.js:
 *   theme, nav, ARIA announcer, toast, modal, loader, game-screen
 *   helpers (showQuestion, showFeedback, hideFeedback, updateHUD).
 *
 * @version 3.0.0
 * @since   Phase 3
 */

'use strict';

/* ── External Module Imports ─────────────────────────────────── */
import { getSettings, saveSettings } from './progress-storage.js';
import { audioManager } from './sound-controller.js';

/* ══════════════════════════════════════════════════════════════
   SECTION 1 – CONSTANTS
   ══════════════════════════════════════════════════════════════ */

const DARK_THEME_CLASS  = 'theme-dark';
const NAV_ACTIVE_CLASS  = 'nav-link--active';
const ARIA_ANNOUNCER_ID = 'aria-announcer';
const TOAST_DURATION_MS = 3000;

/**
 * Feedback overlay content by outcome.
 */
const FEEDBACK_CONTENT = {
  correct: {
    icon:    '🎉',
    title:   'Great counting!',
    message: 'You built the right number.',
    cssClass:'feedback-overlay--correct',
  },
  incorrect: {
    icon:    '🤔',
    title:   'Almost there.',
    message: 'Check each place-value rod and try again.',
    cssClass:'feedback-overlay--incorrect',
  },
};

/* ══════════════════════════════════════════════════════════════
   SECTION 2 – MODULE STATE
   ══════════════════════════════════════════════════════════════ */

/** @type {HTMLElement|null} */
let _announcerEl = null;

/** @type {Set<number>} */
const _toastTimeouts = new Set();

/** Active modal element (or null). */
let _activeModal = null;

/** Element that had focus before a modal opened (for restoration). */
let _modalReturnFocus = null;

/* ══════════════════════════════════════════════════════════════
   SECTION 3 – INITIALISATION
   ══════════════════════════════════════════════════════════════ */

/**
 * initUI()
 * ────────
 * Bootstrap all shared UI features. Called once during app boot.
 *
 * @returns {Promise<void>}
 */
async function initUI() {
  _createAriaAnnouncer();
  _applyTheme(getSettings().theme);
  _markActiveNavLink();
  _initSoundToggle();
  _initKeyboardNav();
}

/* ══════════════════════════════════════════════════════════════
   SECTION 4 – THEME
   ══════════════════════════════════════════════════════════════ */

function setTheme(theme) {
  _applyTheme(theme);
  saveSettings({ theme });
}

function toggleTheme() {
  const current = getSettings().theme;
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/* ══════════════════════════════════════════════════════════════
   SECTION 5 – GAME SCREEN HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * showQuestion()
 * ──────────────
 * Render a question object into the game screen question panel.
 *
 * @param {{ prompt: string, hint?: string, activity?: string }} question
 */
function showQuestion(question) {
  const promptEl = document.getElementById('question-prompt');
  const hintEl   = document.getElementById('hint-panel');
  const hintText = document.getElementById('hint-text');
  const hintBtn  = document.getElementById('hint-btn');

  if (promptEl) {
    promptEl.textContent = question.prompt;
    // Brief fade-in
    promptEl.style.opacity = '0';
    requestAnimationFrame(() => {
      promptEl.style.transition = 'opacity 0.25s ease';
      promptEl.style.opacity    = '1';
    });
  }

  // Hide the hint panel until the Hint button is pressed
  if (hintEl)   { hintEl.hidden = true; }
  if (hintText) { hintText.textContent = question.hint ?? ''; }
  if (hintBtn)  {
    hintBtn.setAttribute('aria-expanded', 'false');
    // Disable hint button if no hint provided
    hintBtn.disabled = !question.hint;
  }

  announce(`Question: ${question.prompt}`, 'polite');

  // Notify app.js that a new question has started so it can reset hint state
  document.dispatchEvent(new CustomEvent('ewk:newQuestion', { detail: { question } }));
}

/**
 * triggerConfetti()
 * ──────────────
 * Generates colorful confetti particles.
 */
export function triggerConfetti() {
  const colors = ['#3A86FF', '#FFD166', '#55C271', '#FF6B6B', '#9B6BFF'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = `-20px`;
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    
    // Animation
    confetti.style.animation = `confetti-fall ${Math.random() * 1.5 + 1.5}s linear forwards`;
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

/**
 * showFeedback()
 * ──────────────
 * Show the feedback overlay with the appropriate icon/message.
 *
 * @param {boolean} correct
 */
function showFeedback(correct) {
  const overlay   = document.getElementById('feedback-overlay');
  if (!overlay) return;

  const content  = correct ? FEEDBACK_CONTENT.correct : FEEDBACK_CONTENT.incorrect;
  const iconEl   = overlay.querySelector('.feedback-icon');
  const titleEl  = document.getElementById('feedback-title');
  const msgEl    = document.getElementById('feedback-message');

  // Remove both modifier classes and apply the right one
  overlay.classList.remove('feedback-overlay--correct', 'feedback-overlay--incorrect');
  overlay.classList.add(content.cssClass);

  if (iconEl)  iconEl.textContent  = content.icon;
  if (titleEl) titleEl.textContent = content.title;
  if (msgEl)   msgEl.textContent   = content.message;

  overlay.hidden = false;
  overlay.removeAttribute('aria-hidden');

  // Announce to screen readers
  announce(correct ? content.title : content.title + '. ' + content.message, 'assertive');

  if (correct) {
    triggerConfetti();
  }
}

/**
 * hideFeedback()
 * ──────────────
 * Hide the feedback overlay.
 */
function hideFeedback() {
  const overlay = document.getElementById('feedback-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
}

/**
 * updateHUD()
 * ───────────
 * Update the in-game HUD: score, question counter, progress bar.
 *
 * @param {number} score
 * @param {{ questionIndex?: number, totalQuestions?: number, progress?: number }} [extras={}]
 */
function updateHUD(score, extras = {}) {
  // Activity Name
  if (extras.activityId) {
    const activityNames = {
      number_garden: 'Number Garden',
      addition_bridge: 'Addition Bridge',
      subtraction_cave: 'Subtraction Cave',
      place_value_tower: 'Place Value Tower',
      pattern_train: 'Pattern Train',
    };
    const nameEl = document.getElementById('hud-activity-name');
    if (nameEl) nameEl.textContent = activityNames[extras.activityId] || extras.activityId;
  }

  // Score
  const scoreEl = document.getElementById('hud-score');
  if (scoreEl) scoreEl.textContent = String(score);

  // Question counter
  const { questionIndex, totalQuestions } = extras;
  if (questionIndex !== undefined && totalQuestions !== undefined) {
    const countEl  = document.getElementById('hud-question-count');
    const badgeEl  = document.getElementById('question-badge');
    const labelEl  = document.getElementById('progress-label');

    const display = `${questionIndex + 1} / ${totalQuestions}`;
    if (countEl)  countEl.textContent = display;
    if (badgeEl)  badgeEl.textContent = String(questionIndex + 1);
    if (labelEl)  labelEl.textContent = `Progress: ${questionIndex + 1} of ${totalQuestions}`;
  }

  // Progress bar
  if (extras.progress !== undefined) {
    const fillEl   = document.getElementById('progress-fill');
    const trackEl  = fillEl?.closest('[role="progressbar"]');
    const pct      = Math.max(0, Math.min(100, extras.progress));
    if (fillEl)  fillEl.style.width = `${pct}%`;
    if (trackEl) trackEl.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  // Stars
  if (extras.stars !== undefined) {
    const starContainers = [
      document.getElementById('hud-stars'), 
      document.querySelector('.sidebar-stars .stars')
    ];
    starContainers.forEach(container => {
      if (container) {
        const starEls = container.querySelectorAll('.star');
        starEls.forEach((starEl, index) => {
          if (index < extras.stars) {
            starEl.classList.add('star--filled');
          } else {
            starEl.classList.remove('star--filled');
          }
        });
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 – TOAST NOTIFICATIONS
   ══════════════════════════════════════════════════════════════ */

/**
 * showToast()
 * ───────────
 * Display a transient notification toast.
 *
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} [type='info']
 * @param {number} [duration]
 */
function showToast(message, type = 'info', duration = TOAST_DURATION_MS) {
  // Build the toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // Type-specific styling
  const typeColors = {
    success: 'var(--c-green-dark)',
    error:   'var(--c-coral-dark)',
    warning: '#7A5400',
    info:    'var(--c-deep-blue)',
  };
  toast.style.background = typeColors[type] ?? typeColors.info;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger slide-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  // Auto-dismiss
  const timerId = setTimeout(() => {
    toast.classList.remove('toast--visible');
    const removeId = setTimeout(() => toast.remove(), 400);
    _toastTimeouts.delete(timerId);
    _toastTimeouts.add(removeId);
  }, duration);
  _toastTimeouts.add(timerId);
}

/**
 * dismissAllToasts()
 */
function dismissAllToasts() {
  _toastTimeouts.forEach(id => clearTimeout(id));
  _toastTimeouts.clear();
  document.querySelectorAll('.toast').forEach(t => t.remove());
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 – MODAL (focus-trapped)
   ══════════════════════════════════════════════════════════════ */

/**
 * showModal()
 * ───────────
 * Display a modal with optional confirm/cancel actions.
 * Traps focus inside the modal (WCAG 2.1.2).
 *
 * @param {{ title: string, content: string|HTMLElement, onConfirm?: Function, onCancel?: Function }} options
 */
function showModal(options) {
  closeModal(); // close any existing modal first

  _modalReturnFocus = document.activeElement;

  // Build modal DOM
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role',       'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'modal-title');

  const panel = document.createElement('div');
  panel.className = 'modal-panel';

  const titleEl = document.createElement('h2');
  titleEl.id          = 'modal-title';
  titleEl.textContent = options.title;
  panel.appendChild(titleEl);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'modal-body';
  if (typeof options.content === 'string') {
    bodyEl.textContent = options.content;
  } else {
    bodyEl.appendChild(options.content);
  }
  panel.appendChild(bodyEl);

  // Buttons
  const actionsEl = document.createElement('div');
  actionsEl.className = 'modal-actions';

  if (options.onConfirm) {
    const confirmBtn = document.createElement('button');
    confirmBtn.className   = 'btn btn--primary';
    confirmBtn.textContent = 'OK';
    confirmBtn.addEventListener('click', () => { options.onConfirm?.(); closeModal(); });
    actionsEl.appendChild(confirmBtn);
  }
  if (options.onCancel) {
    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'btn btn--outline';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => { options.onCancel?.(); closeModal(); });
    actionsEl.appendChild(cancelBtn);
  }
  panel.appendChild(actionsEl);
  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  _activeModal = backdrop;

  // Focus trap
  const focusable = backdrop.querySelectorAll('button, a, input, [tabindex="0"]');
  if (focusable.length) focusable[0].focus();

  backdrop.addEventListener('keydown', _trapModalFocus);
  backdrop.addEventListener('click',   e => { if (e.target === backdrop) closeModal(); });
}

/**
 * closeModal()
 */
function closeModal() {
  if (!_activeModal) return;
  _activeModal.removeEventListener('keydown', _trapModalFocus);
  _activeModal.remove();
  _activeModal = null;
  _modalReturnFocus?.focus();
}

/**
 * _trapModalFocus()
 * ─────────────────
 * Cycle Tab focus inside the modal. Close on Escape.
 *
 * @private
 * @param {KeyboardEvent} e
 */
function _trapModalFocus(e) {
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key !== 'Tab')    return;

  const focusable = Array.from(
    _activeModal.querySelectorAll('button, a, input, [tabindex="0"]')
  ).filter(el => !el.disabled);
  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 – LOADER
   ══════════════════════════════════════════════════════════════ */

/**
 * showLoader()
 * ────────────
 * Display a full-page loading overlay.
 *
 * @param {string} [message='Loading…']
 */
function showLoader(message = 'Loading…') {
  dismissAllToasts();
  let loader = document.getElementById('_ewk_loader');
  if (loader) { loader.querySelector('.loader-text').textContent = message; return; }

  loader = document.createElement('div');
  loader.id = '_ewk_loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999',
    'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:center',
    'background:rgba(255,255,255,.85)', 'backdrop-filter:blur(6px)',
    'gap:1rem',
  ].join(';');

  const spinner = document.createElement('div');
  spinner.style.cssText = [
    'width:48px', 'height:48px',
    'border:5px solid var(--c-border)',
    'border-top-color:var(--c-bright-blue)',
    'border-radius:50%',
    'animation:spin 0.7s linear infinite',
  ].join(';');

  const text = document.createElement('p');
  text.className       = 'loader-text';
  text.textContent     = message;
  text.style.cssText   = 'font-weight:700;color:var(--c-deep-blue);font-size:1.125rem;';

  loader.appendChild(spinner);
  loader.appendChild(text);
  document.body.appendChild(loader);
}

/**
 * hideLoader()
 */
function hideLoader() {
  document.getElementById('_ewk_loader')?.remove();
}

/* ══════════════════════════════════════════════════════════════
   SECTION 9 – ACCESSIBILITY HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * announce()
 * ──────────
 * Post a message to the ARIA live region.
 *
 * @param {string} message
 * @param {'polite'|'assertive'} [priority='polite']
 */
function announce(message, priority = 'polite') {
  if (!_announcerEl) return;
  _announcerEl.setAttribute('aria-live', priority);
  _announcerEl.textContent = '';
  requestAnimationFrame(() => { _announcerEl.textContent = message; });
}

/* ══════════════════════════════════════════════════════════════
   SECTION 10 – PRIVATE HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * _createAriaAnnouncer()
 * @private
 */
function _createAriaAnnouncer() {
  if (document.getElementById(ARIA_ANNOUNCER_ID)) {
    _announcerEl = document.getElementById(ARIA_ANNOUNCER_ID);
    return;
  }
  _announcerEl = document.createElement('div');
  _announcerEl.id = ARIA_ANNOUNCER_ID;
  _announcerEl.setAttribute('role',       'status');
  _announcerEl.setAttribute('aria-live',  'polite');
  _announcerEl.setAttribute('aria-atomic','true');
  _announcerEl.className = 'sr-only';
  document.body.appendChild(_announcerEl);
}

/**
 * _applyTheme()
 * @private
 * @param {'light'|'dark'|'auto'} theme
 */
function _applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add(DARK_THEME_CLASS);
  } else if (theme === 'light') {
    html.classList.remove(DARK_THEME_CLASS);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle(DARK_THEME_CLASS, prefersDark);
  }
}

/**
 * _markActiveNavLink()
 * @private
 */
function _markActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href     = (link.getAttribute('href') ?? '').toLowerCase();
    const isActive =
      currentPath.endsWith(href) ||
      (href.includes('index') && (currentPath === '/' || currentPath.endsWith('/')));
    link.classList.toggle(NAV_ACTIVE_CLASS, isActive);
    if (!link.hasAttribute('aria-current') || link.getAttribute('aria-current') === 'false') {
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    }
  });
}

/**
 * _initSoundToggle()
 * ──────────────────
 * Wire up the sound toggle button (exists on all pages).
 * Does NOT call playSound — that's handled by sound.js.
 *
 * @private
 */
function _initSoundToggle() {
  document.querySelectorAll('#sound-toggle, #game-sound-btn').forEach(btn => {
    if (!btn) return;
    const settings = getSettings();
    btn.setAttribute('aria-pressed', String(settings.soundEnabled));

    btn.addEventListener('click', () => {
      const isMuted = audioManager.toggleMute();
      // aria-pressed represents soundEnabled (true if NOT muted)
      btn.setAttribute('aria-pressed', String(!isMuted));
      // Visual icon swap handled by CSS aria-pressed selector
    });
  });
}

/**
 * _initKeyboardNav()
 * ──────────────────
 * Global keyboard shortcuts.
 *   Escape  → close any open modal
 *
 * @private
 */
function _initKeyboardNav() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _activeModal) closeModal();
  });
}

/* ── Public Exports ──────────────────────────────────────────── */
export {
  initUI,
  setTheme,
  toggleTheme,
  showQuestion,
  showFeedback,
  hideFeedback,
  updateHUD,
  showToast,
  dismissAllToasts,
  showModal,
  closeModal,
  showLoader,
  hideLoader,
  announce,
};

