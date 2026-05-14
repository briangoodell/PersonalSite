/* ============================================================
   PROJECTS DATA & RENDERER
   ============================================================
   To reorder projects: move items in the PROJECTS array.
   To add a project: add a new entry to PROJECTS.
   To add a photo: set photo to the relative path, e.g. 'images/myproject.jpg'

   aiLevel: 0 = Hand-built (no AI)
            1 = AI Consulted (research / brainstorming)
            2 = AI Assisted (AI helped write or optimize parts)
            3 = AI Authored (heavily or entirely AI-generated)
   ============================================================ */

/**
 * @typedef {Object} Project
 * @property {string}                           id
 * @property {string}                           name
 * @property {string}                           description
 * @property {'work'|'class'|'solo'}    badge
 * @property {string|null}                      github
 * @property {string|null}                      externalUrl
 * @property {string|null}                      detailPage
 * @property {string|null}                      photo
 * @property {string}                           phTone
 * @property {string|null}                      badgeLabel
 * @property {0|1|2|3}                          aiLevel
 */

/** @type {Project[]} */
const PROJECTS = [
  /* ── Work ────────────────────────────────────────────────── */
  {
    id:          'autocell-live',
    name:        'AutoCellLabel Live',
    description: 'Real-time single-channel neural labeling network for C. elegans. ~50× faster than the original 4-channel model, enabling online trace extraction and entirely new experiment types.',
    badge:       'work',
    github:      null,
    externalUrl: 'https://live.briandalegoodell.com',
    detailPage:  'flavell-lab.html#autocell',
    photo:       'images/flavell/ACL_labels.gif',
    phTone:      'ph-sage',
    badgeLabel:  'Flavell Lab',
    aiLevel:     2,
  },
  {
    id:          'laser-project',
    name:        'The Laser Project',
    description: 'NIR laser system that creates any arbitrary thermal environment for a freely moving C. elegans. Custom cooling allows sub-ambient temperatures; instant environment switching isolates decision-making moments.',
    badge:       'work',
    github:      null,
    externalUrl: 'http://laser.briandalegoodell.com/',
    detailPage:  'flavell-lab.html#laser',
    photo:       'images/flavell/v6-clear-worm.png',
    phTone:      'ph-terra',
    badgeLabel:  'Flavell Lab',
    aiLevel:     1,
  },
  {
    id:          'brainalignnet',
    name:        'BrainAlignNet',
    description: 'Extended the BrainAlignNet brain-registration pipeline to a new species (jellyfish), demonstrating robustness across distant modalities and morphologies.',
    badge:       'work',
    github:      null,
    externalUrl: 'https://doi.org/10.7554/eLife.108159.2',
    detailPage:  'flavell-lab.html#brainalignnet',
    photo:       'images/flavell/BAN_Figure_6-cropped.png',
    phTone:      'ph-brown',
    badgeLabel:  'Flavell Lab',
    aiLevel:     1,
  },

  /* ── Class ───────────────────────────────────────────────── */
  {
    id:          'tanks',
    name:        'Tank Game',
    description: 'Networked multiplayer game with a fun surprise. Explores and exploits inter-process communication, shared memory, and real-time event handling in C.',
    badge:       'class',
    github:      'https://github.com/bradleyramsey/TanksProject',
    externalUrl: null,
    detailPage:  null,
    photo:       null,
    phTone:      'ph-brown',
    badgeLabel:  'OS Final',
    aiLevel:     0,
  },
  {
    id:          'grinsync',
    name:        'GrinSync',
    description: 'A campus scheduling and event-coordination tool built as a team class project. I led the backend subgroup.',
    badge:       'class',
    github:      'https://github.com/GrinSync',
    externalUrl: null,
    detailPage:  null,
    photo:       null,
    phTone:      'ph-sage',
    badgeLabel:  'Software Dev Final',
    aiLevel:     0,
  },

  /* ── Solo ────────────────────────────────────────────────── */
  {
    id:          'roosrun',
    name:        'RoosRun',
    description: 'A website built to help my college cross country team stay connected — run logging, social features, and more. (keeping the aesthetic of the previous site)',
    badge:       'solo',
    github:      null,
    externalUrl: 'https://roosrun.com',
    detailPage:  null,
    photo:       null,
    phTone:      'ph-terra',
    badgeLabel:  null,
    aiLevel:     0,
  },
  {
    id:          'personalSite',
    name:        'This Website',
    description: 'Creating a personal website always felt daunting, so as someone who has made several websites, I decided to treat it as an experiment on how efficiently LLMs might improve my workflow.',
    badge:       'solo',
    github:      null,
    externalUrl: null,
    detailPage:  null,
    photo:       null,
    phTone:      'ph-terra',
    badgeLabel:  null,
    aiLevel:     4,
  },

  /* ── Solo ───────────────────────────────────────────────── */
  {
    id:          'van',
    name:        'The Van',
    description: 'Converted my family\'s minivan into a camper over COVID — custom futon, solar panels, and a cellular antenna. Spent half of freshman year taking classes online from National Parks.',
    badge:       'solo',
    github:      null,
    externalUrl: null,
    detailPage:  null,
    photo:       'images/hobbies/BuffaloClasses.jpg',
    phTone:      'ph-brown',
    badgeLabel:  null,
    aiLevel:     0,
  },
  {
    id:          'woodworking',
    name:        'Woodworking',
    description: 'Three and a half years in a makerspace making furniture, art, and project components. Work includes intarsia, a walnut table, chopsticks, and train domino sets.',
    badge:       'solo',
    github:      null,
    externalUrl: null,
    detailPage:  null,
    photo:       'images/hobbies/TrainDominosCenter.jpg',
    phTone:      'ph-terra',
    badgeLabel:  null,
    aiLevel:     0,
  },
  {
    id:          'crafting',
    name:        'Miscellaneous Crafting',
    description: 'Engraved mountains into wine glasses, built a hollow pool ball for a marriage proposal (not mine), sewed, embroidered, and generally had fun making things.',
    badge:       'solo',
    github:      null,
    externalUrl: null,
    detailPage:  null,
    photo:       'images/hobbies/MountainGlass.jpg',
    phTone:      'ph-sage',
    badgeLabel:  null,
    aiLevel:     0,
  },
];

/* ============================================================
   AI INVOLVEMENT METER
   Shared component — rendered both in project cards and on the
   lab page (via inline HTML, see flavell-lab.html).
   ============================================================ */

const AI_LEVELS = [
  { name: 'Hand-built',   short: 'Hand-built',   desc: 'No AI assistance.' },
  { name: 'LLM Consulted', short: 'LLM-Consulted', desc: 'Used AI for brainstorming, research, or rubber-ducking — not for output.' },
  { name: 'LLM Assisted',  short: 'LLM-Assisted',  desc: 'AI helped write or optimize portions, under close direction and review.' },
  { name: 'LLM Authored',  short: 'LLM-Authored',  desc: 'Heavily or entirely AI-generated; I orchestrated and audited.' },
];

/** Renders the meter as an HTML string. `level` = 0..3. */
function buildAIMeterHTML(level, opts = {}) {
  const safe = Math.max(0, Math.min(3, Number(level) || 0));
  const { popoverAlign = 'left', popoverDir = 'down' } = opts;

  // Inline pips on the trigger
  const pips = Array.from({ length: 4 }, (_, i) => {
    // L0 → 0 filled, L1 → 1, L2 → 2, L3 → 4
    const filled = safe === 3 ? 4 : safe;
    const on = i < filled;
    return `<i class="${on ? 'on' : ''}"></i>`;
  }).join('');

  const current = AI_LEVELS[safe];

  // Build the scale rows for the popover
  const scaleRows = AI_LEVELS.map((lvl, idx) => {
    const filled = idx === 3 ? 4 : idx;
    const rowPips = Array.from({ length: 4 }, (_, i) => {
      const on = i < filled;
      return `<i class="${on ? 'on' : ''}"></i>`;
    }).join('');
    const isCurrent = idx === safe;
    return `
      <div class="ai-meter__level" data-current="${isCurrent}">
        <span class="ai-meter__level-pips" aria-hidden="true">${rowPips}</span>
        <span class="ai-meter__level-body">
          <span class="ai-meter__level-name">${lvl.name}</span>
          <span class="ai-meter__level-desc">${lvl.desc}</span>
        </span>
      </div>`;
  }).join('');

  const modifiers = [
    popoverAlign === 'right' ? 'ai-meter--right' : '',
    popoverDir === 'up' ? 'ai-meter--up' : '',
  ].filter(Boolean).join(' ');

  return `
    <button type="button" class="ai-meter ${modifiers}"
            data-ai-level="${safe}"
            aria-label="AI involvement: ${current.name}. Click for details."
            aria-haspopup="dialog"
            aria-expanded="false">
      <span class="ai-meter__pips" aria-hidden="true">${pips}</span>
      <span class="ai-meter__label">${current.short}</span>
      <span class="ai-meter__pop" role="dialog" aria-label="AI involvement scale">
        <span class="ai-meter__pop-title">AI Involvement</span>
        <span class="ai-meter__scale">${scaleRows}</span>
        <a href="ai_philosophy.html" class="ai-meter__pop-link" data-track-click="true">
          Read my AI philosophy <span class="arrow">↗</span>
        </a>
      </span>
    </button>
  `;
}

/* Mobile-friendly toggle: click on the meter opens the popover.
   Click outside or on another meter closes it. */
function attachAIMeterToggles(root = document) {
  function repositionMeter(meter) {
    const rect = meter.getBoundingClientRect();
    meter.classList.toggle('ai-meter--right', rect.left + 318 > window.innerWidth - 8);
    meter.classList.toggle('ai-meter--up',    rect.bottom + 240 > window.innerHeight - 8);
  }

  // Reposition on hover/focus before CSS transition kicks in
  root.addEventListener('mouseenter', (e) => {
    const meter = e.target.closest('.ai-meter');
    if (meter) repositionMeter(meter);
  }, true);

  root.addEventListener('focusin', (e) => {
    const meter = e.target.closest('.ai-meter');
    if (meter) repositionMeter(meter);
  });

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('.ai-meter');
    const link = e.target.closest('.ai-meter__pop-link, .ai-meter__pop a');

    // Let the philosophy link work normally
    if (link) return;

    if (trigger) {
      e.preventDefault();
      const wasOpen = trigger.classList.contains('is-open');
      document.querySelectorAll('.ai-meter.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        repositionMeter(trigger);
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    } else {
      // Click outside — close all
      document.querySelectorAll('.ai-meter.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.ai-meter.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.setAttribute('aria-expanded', 'false');
        el.blur();
      });
    }
  });
}

/* ============================================================
   PROJECT CARD RENDERER
   ============================================================ */

const BADGE_DISPLAY = {
  work:  'Work',
  class: 'Class',
  solo:  'Solo',
};

function buildProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'project-card';
  article.dataset.badge = project.badge;
  article.dataset.hidden = 'false';
  article.setAttribute('role', 'listitem');
  article.id = `project-${project.id}`;

  const imgHtml = project.photo
    ? `<img src="${project.photo}" alt="${project.name}" class="project-card__img" loading="lazy">`
    : `<div class="ph-image ph-image--fixed"
            data-label="${project.name}"
            style="--ph-fill: var(--${project.phTone}); height: 100%;">
       </div>`;

  const badgeHtml = `
    <span class="project-badge project-badge--${project.badge}">
      ${BADGE_DISPLAY[project.badge]}
    </span>
    ${project.badgeLabel
      ? `<span class="project-badge-label">${project.badgeLabel}</span>`
      : ''}
  `;

  const primaryUrl = project.detailPage || project.externalUrl || project.github;
  const primaryLabel = project.detailPage
    ? 'Details &rarr;'
    : project.externalUrl
      ? 'Visit &rarr;'
      : 'GitHub &rarr;';

  const linkHtml = primaryUrl
    ? `<a href="${primaryUrl}"
          class="btn btn--ghost btn--sm project-card__primary-link"
          ${!project.detailPage ? 'target="_blank" rel="noopener"' : ''}
          data-track-click="true">
         ${primaryLabel}
       </a>`
    : '';

  const githubExtra = project.github && project.detailPage
    ? `<a href="${project.github}" class="btn btn--ghost btn--sm" target="_blank" rel="noopener" data-track-click="true">GitHub</a>`
    : '';

  const meterHtml = buildAIMeterHTML(project.aiLevel ?? 0);

  article.innerHTML = `
    <div class="project-card__img-wrap">${imgHtml}</div>
    <div class="project-card__body">
      <h3 class="project-card__name">${project.name}</h3>
      <p class="project-card__desc">${project.description}</p>
    </div>
    <footer class="project-card__footer">
      <div class="project-card__badges">${badgeHtml}</div>
      ${meterHtml}
    </footer>
    <div class="project-card__actions">
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${githubExtra}${linkHtml}</div>
    </div>
  `;

  return article;
}

function initProjectsPage() {
  const grid = document.getElementById('projects-grid');

  if (grid) {
    PROJECTS.forEach(p => grid.appendChild(buildProjectCard(p)));

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => {
          b.classList.toggle('filter-btn--active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });

        grid.querySelectorAll('.project-card').forEach(card => {
          const show = filter === 'all' || card.dataset.badge === filter;
          card.dataset.hidden = show ? 'false' : 'true';
        });
      });
    });
  }

  // Mount any `<span data-ai-meter data-level="N">` placeholders found in the page.
  // The lab page uses these inside each project header.
  document.querySelectorAll('[data-ai-meter]').forEach(el => {
    const lvl = parseInt(el.dataset.level, 10) || 0;
    const align = el.dataset.align || 'left';
    const dir = el.dataset.dir || 'down';
    el.outerHTML = buildAIMeterHTML(lvl, { popoverAlign: align, popoverDir: dir });
  });

  attachAIMeterToggles();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
  initProjectsPage();
}
