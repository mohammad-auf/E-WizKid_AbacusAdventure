/**
 * @file app.js
 * @module App
 * @description Phase 5 - E-Wiz Kid Abacus Adventure – Application Entry Point.
 */

'use strict';

import { initUI, showToast, showModal, closeModal } from './ui.js';
import { initGame, submitAnswer, pauseGame, resumeGame } from './game-engine.js';
import { initAbacus, reset as resetAbacus, ABACUS_CHANGE_EVENT } from './abacus-controller.js';
import { getPageId, debounce } from './utils.js';
import { initStorage, getLastSessionResults } from './progress-storage.js';
import { audioManager } from './sound-controller.js';

// ── Hint state (one hint per question) ─────────────────────────
let _hintUsed = false;

const APP_CONFIG = Object.freeze({
  version:  '5.0.0',
  appName:  'E-Wiz Kid Abacus Adventure',
  debug:    false,
  breakpoints: Object.freeze({
    xs:  320,
    sm:  480,
    md:  768,
    lg:  1024,
    xl:  1440,
  }),
});

const PAGE_REGISTRY = [
  { id: 'home',     init: initHomePage     },
  { id: 'activity', init: initActivityPage },
  { id: 'game',     init: initGamePage     },
  { id: 'results',  init: initResultsPage  },
  { id: 'help',     init: initHelpPage     },
];

async function boot() {
  try {
    log('Boot sequence started.', APP_CONFIG.version);

    await initStorage();
    audioManager.initialize();
    await initUI();

    // Global audio unlock and click handler
    document.addEventListener('click', (e) => {
      audioManager.unlockAudio();
      
      const btn = e.target.closest('button, .btn, .activity-card__play');
      const link = e.target.closest('a');
      const isBead = e.target.closest('.bead');
      
      if ((btn || link) && !isBead) {
        audioManager.play('click');
      }

      // Handle navigation delay to allow sound to play
      if (!e.defaultPrevented && link && link.href && !link.href.includes('#') && link.target !== '_blank' && !link.hasAttribute('download')) {
        e.preventDefault();
        setTimeout(() => {
          window.location.href = link.href;
        }, 150);
      }
    });

    // Inject the landscape background globally
    const bg = document.createElement('div');
    bg.className = 'landscape-bg';
    bg.innerHTML = `
      <div class="star-deco star-1"></div>
      <div class="star-deco star-2"></div>
      <div class="star-deco star-3"></div>
      <div class="star-deco star-4"></div>
    `;
    document.body.prepend(bg);

    const pageId = getPageId();
    const page   = PAGE_REGISTRY.find(p => p.id === pageId);

    if (page) {
      log(`Activating page controller: "${page.id}"`);
      await page.init();
    } else {
      log(`No controller found for page: "${pageId}". Using default.`);
    }

    log('Boot sequence complete.');

  } catch (error) {
    console.error('[App] Boot failed:', error);
  }
}

async function initHomePage() {
  log('Home page controller invoked.');

  const continueBtn = document.getElementById('continue-btn');
  const resetBtn = document.getElementById('reset-progress-btn'); // If exists

  if (continueBtn) {
    import('./progress-storage.js').then(({ getProgress, clearProgress }) => {
      const progress = getProgress();
      if (progress && progress.lastActivity && progress.lastLevel) {
        continueBtn.style.display = 'inline-flex';
        continueBtn.addEventListener('click', () => {
          window.location.href = `./game.html?activity=${progress.lastActivity}&level=${progress.lastLevel}`;
        });

        // Inject reset progress button
        let resetBtn = document.getElementById('reset-progress-btn');
        if (!resetBtn) {
          resetBtn = document.createElement('button');
          resetBtn.id = 'reset-progress-btn';
          resetBtn.className = 'btn btn--outline btn--lg';
          resetBtn.style.marginTop = '1rem';
          resetBtn.textContent = 'Reset Progress';
          
          resetBtn.addEventListener('click', () => {
            if (confirm('Reset all saved progress? This cannot be undone.')) {
              clearProgress();
              import('./ui.js').then(({ showToast }) => {
                showToast('Your saved progress has been cleared.', 'info');
              });
              setTimeout(() => window.location.reload(), 1200);
            }
          });
          continueBtn.parentNode.insertBefore(resetBtn, continueBtn.nextSibling);
        }

      } else {
        continueBtn.style.display = 'none';
      }
    });
  }
}

async function initActivityPage() {
  log('Activity page controller invoked.');

  // Segmented Difficulty Toggle Logic
  let currentLevel = 'beginner';
  const diffBtns = document.querySelectorAll('.diff-btn');
  const activityCards = document.querySelectorAll('.activity-card');
  
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update UI active state
      diffBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--c-deep-blue)';
        b.style.boxShadow = 'none';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--c-bright-blue)';
      btn.style.color = 'white';
      btn.style.boxShadow = '0 4px 10px rgba(58,134,255,0.3)';
      
      currentLevel = btn.dataset.level;
      
      // Update links on cards
      activityCards.forEach(card => {
        let href = card.getAttribute('href');
        if (href) {
          href = href.replace(/level=[a-z]+/, 'level=' + currentLevel);
          card.setAttribute('href', href);
        }
      });
      
      // Play sound
      import('./sound-controller.js').then(({ audioManager }) => audioManager.play('click'));
    });
  });

  // Update progress strip
  import('./progress-storage.js').then(({ getProgress }) => {
    const progress = getProgress();
    let totalStars = 0;
    let gamesPlayed = 0;

    Object.keys(progress).forEach(key => {
      if (key !== 'lastActivity' && key !== 'lastLevel') {
        totalStars += (progress[key].stars || 0);
        gamesPlayed++;
      }
    });

    const starEl   = document.getElementById('total-stars');
    const playedEl = document.getElementById('games-played');
    if (starEl)   starEl.textContent   = totalStars;
    if (playedEl) playedEl.textContent = gamesPlayed;
    
    // Update individual activity cards
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
      const href = card.getAttribute('href') || (card.querySelector('.activity-card__play') && card.querySelector('.activity-card__play').getAttribute('href'));
      if (!href) return;
      const match = href.match(/activity=([^&]+)/);
      if (match) {
        const actId = match[1];
        let actStars = 0;
        Object.keys(progress).forEach(k => {
          if (k.startsWith(`${actId}_`)) {
            actStars += (progress[k].stars || 0);
          }
        });
        
        const progressText = card.querySelector('.activity-card__progress-text');
        if (progressText) {
          progressText.textContent = `Stars Earned: ${actStars}`;
        }
        
        const starContainer = card.querySelector('.activity-card__stars');
        if (starContainer) {
          const svgs = starContainer.querySelectorAll('svg');
          const displayStars = Math.min(3, actStars);
          for (let i = 0; i < 3; i++) {
            if (i < displayStars) {
              svgs[i].setAttribute('fill', '#FFD166');
              svgs[i].setAttribute('stroke', '#FFD166');
            } else {
              svgs[i].setAttribute('fill', 'none');
              svgs[i].setAttribute('stroke', '#D1D5DB');
            }
          }
        }
      }
    });
  });

}


async function initGamePage() {
  log('Game page controller invoked.');

  await initAbacus({ startAtZero: true });
  await initGame();
  _wireGameButtons();

  log('Game page ready.');
}

async function initResultsPage() {
  log('Results page controller invoked.');
  
  const results = getLastSessionResults();
  if (!results) {
    window.location.href = './index.html';
    return;
  }

  const titleEl = document.getElementById('results-title');
  const activityNameEl = document.getElementById('results-activity-name');
  const correctEl = document.getElementById('stat-correct');
  const attemptedEl = document.getElementById('stat-attempted');
  const scoreEl = document.getElementById('stat-score');
  
  if (correctEl) correctEl.textContent = results.correctCount;
  if (attemptedEl) attemptedEl.textContent = results.totalCount;
  if (scoreEl) scoreEl.textContent = results.score;
  
  if (activityNameEl) {
    activityNameEl.textContent = `${results.activityId} · Level ${results.level}`;
  }

  const stars = results.stars;
  const starEls = document.querySelectorAll('.results-star');
  starEls.forEach((star, index) => {
    if (index >= stars) {
      star.classList.add('results-star--empty');
    } else {
      star.classList.remove('results-star--empty');
    }
  });

  const nextBtn = document.getElementById('next-level-btn');
  if (nextBtn) {
    const levelProgression = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = levelProgression.indexOf(results.level);
    let nextLevel = results.level; // default to same if not found
    
    if (currentIndex !== -1 && currentIndex < levelProgression.length - 1) {
      nextLevel = levelProgression[currentIndex + 1];
    } else if (currentIndex === levelProgression.length - 1) {
      // If they beat the last level, let them replay it or you could redirect them
      nextLevel = levelProgression[currentIndex];
    }
    
    nextBtn.href = `game.html?activity=${results.activityId}&level=${nextLevel}`;
  }

  const tryAgainBtn = document.getElementById('try-again-btn');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
      window.location.href = `game.html?activity=${results.activityId}&level=${results.level}`;
    });
  }

  // Fire confetti celebration on load
  import('./ui.js').then(({ triggerConfetti }) => {
    triggerConfetti();
  });
}

async function initHelpPage() {
  log('Help page controller invoked.');
  _initHelpAccordion();
}

function _wireGameButtons() {
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetAbacus();
      resetBtn.classList.add('btn--pulsing');
      setTimeout(() => resetBtn.classList.remove('btn--pulsing'), 600);
      showToast('Abacus reset to zero', 'info', 1500);
    });
  }

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitAnswer();
    });
  }

  const hintBtn   = document.getElementById('hint-btn');
  const hintPanel = document.getElementById('hint-panel');
  if (hintBtn && hintPanel) {
    hintBtn.addEventListener('click', () => {
      if (_hintUsed) return;          // enforce one-hint-per-question
      _hintUsed = true;
      hintPanel.hidden = false;
      hintBtn.setAttribute('aria-expanded', 'true');
      // Visually disable so the child knows the hint is spent
      hintBtn.disabled = true;
      hintBtn.title    = 'Hint already used for this question';
    });
  }

  // Reset hint state whenever a new question is shown
  // (ui.js showQuestion() hides the panel & resets aria-expanded,
  //  we just need to clear _hintUsed and re-enable the button here)
  document.addEventListener('ewk:newQuestion', () => {
    _hintUsed = false;
    if (hintBtn) {
      hintBtn.disabled = false;
      hintBtn.removeAttribute('title');
      hintBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const pauseBtn    = document.getElementById('game-pause-btn');
  const pauseOverlay= document.getElementById('pause-overlay');
  const resumeBtn   = document.getElementById('resume-btn');

  if (pauseBtn && pauseOverlay) {
    pauseBtn.addEventListener('click', () => {
      pauseGame();
      pauseOverlay.hidden = false;
      resumeBtn?.focus();
    });
  }

  if (resumeBtn && pauseOverlay) {
    resumeBtn.addEventListener('click', () => {
      pauseOverlay.hidden = true;
      resumeGame();
      document.getElementById('submit-btn')?.focus();
    });
  }

  document.querySelector('.abacus-stage')?.addEventListener(
    ABACUS_CHANGE_EVENT,
    _onAbacusChange
  );
}

function _onAbacusChange(e) {
  log('Abacus changed. New value:', e.detail.value);
}

function _initHelpAccordion() {
  document.querySelectorAll('details').forEach(detail => {
    const summary = detail.querySelector('summary');
    if (!summary) return;

    detail.addEventListener('toggle', () => {
      detail.classList.toggle('open', detail.open);
    });
  });
}

function onVisibilityChange() {
  if (getPageId() !== 'game') return;
  if (document.hidden) {
    log('Page hidden – game should pause.');
    import('./game-engine.js').then(({ pauseGame }) => pauseGame());
  }
}

const onResize = debounce(() => {
  log('Window resized. Width:', window.innerWidth);
}, 200);

function log(...args) {
  if (APP_CONFIG.debug) {
    console.log('[App]', ...args);
  }
}

document.addEventListener('visibilitychange', onVisibilityChange);
window.addEventListener('resize', onResize);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { APP_CONFIG };

