/* ============================================================
   DJANGO API INTEGRATION
   ============================================================
   On page load, fires a single GET to /hello with tracking
   info in the request body. If the response includes content
   overrides, they are applied to matching [data-content-id]
   elements; otherwise the page is left as-is.

   HOW TO ENABLE:
     1. Set API_BASE_URL to your Django server URL
     2. Set PAGE_TRACKING_ENABLED to true
     3. Your Django API must have CORS configured to allow
        your GitHub Pages domain.

   SECURITY NOTE (for Django side):
     Content injected via innerHTML must be sanitized with
     bleach.clean() before storing or serving to prevent XSS.
   ============================================================ */

// const API_BASE_URL          = 'https://api.briandalegoodell.com';
const API_BASE_URL          = 'http://localhost:8000';
const PAGE_TRACKING_ENABLED = true;
const CONTENT_FETCH_TIMEOUT = 1500;  // ms — fall back to defaults after this

/* ---- Canvas fingerprinting -------------------------------- */

let _canvasFingerprint = null;

function getCanvasFingerprint() {
  if (_canvasFingerprint) return _canvasFingerprint;

  const cached = sessionStorage.getItem('bg_canvas_fp');
  if (cached) {
    _canvasFingerprint = cached;
    return _canvasFingerprint;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width  = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle    = '#f60';
    ctx.fillRect(10, 1, 100, 20);

    ctx.fillStyle = '#069';
    ctx.font      = '14px Arial';
    ctx.fillText('canvas fp \u{1F300}', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font      = '12px Times New Roman';
    ctx.fillText('canvas fp \u{1F300}', 4, 30);

    const raw = canvas.toDataURL();
    // djb2-style hash over the data URL
    let h = 5381;
    for (let i = 0; i < raw.length; i++) {
      h = (((h << 5) + h) ^ raw.charCodeAt(i)) >>> 0;
    }
    _canvasFingerprint = h.toString(16).padStart(8, '0');
  } catch (_) {
    _canvasFingerprint = 'unsupported';
  }

  sessionStorage.setItem('bg_canvas_fp', _canvasFingerprint);
  return _canvasFingerprint;
}

/* ---- Session management ----------------------------------- */

function getSessionId() {
  const KEY = 'bg_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/* ---- Core POST helper (fire-and-forget) ------------------- */

async function trackPost(endpoint, payload) {
  if (!API_BASE_URL || !PAGE_TRACKING_ENABLED) return;
  try {
    await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (_) { /* silent */ }
}

/* ---- Hello (visit tracking + optional content overrides) -- */

async function helloPage(pageId, sessionId, referralSource) {
  if (!API_BASE_URL || !PAGE_TRACKING_ENABLED) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT);
  try {
    const resp = await fetch(`${API_BASE_URL}/hello`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        sessionId,
        fingerprint:    getCanvasFingerprint(),
        timestamp:      new Date().toISOString(),
        referrer:       document.referrer || null,
        referralSource: referralSource || null,
        userAgent:      navigator.userAgent,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return;
    const data = await resp.json();
    if (data.sections) applyContentOverrides(data.sections);
    return data.visitId ?? null;
  } catch (_) {
    clearTimeout(timer);
  }
  return null;
}

/* ---- Click tracking (delegated) --------------------------- */

function attachClickTracking(pageId, sessionId) {
  if (!API_BASE_URL || !PAGE_TRACKING_ENABLED) return;
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-track-click="true"]');
    if (!target) return;
    const href = target.getAttribute('href')
      || target.dataset.target
      || target.textContent.trim();
    trackPost('/bye', {
      type:      'click',
      target:    href,
      pageId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  });
}

/* ---- Duration tracking (sendBeacon on unload) ------------- */

function attachDurationTracking(pageId, sessionId, startTime, visitId) {
  if (!API_BASE_URL || !PAGE_TRACKING_ENABLED) return;

  let activeDuration = 0;
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : null;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (visibleSince !== null) {
        activeDuration += Date.now() - visibleSince;
        visibleSince = null;
      }
    } else {
      visibleSince = Date.now();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (visibleSince !== null) activeDuration += Date.now() - visibleSince;
    const seconds = Math.round(activeDuration / 1000);
    const payload = JSON.stringify({ type: 'duration', seconds, pageId, sessionId, visitId });
    try {
      fetch(`${API_BASE_URL}/hey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    } catch (_) { /* silent */ }
  });
}

/* ---- Apply content overrides to data-content-id elements -- */

function applyContentOverrides(sections) {
  if (!sections || typeof sections !== 'object') return;
  for (const [id, html] of Object.entries(sections)) {
    if (typeof html !== 'string' || !html.trim()) continue;
    const el = document.querySelector(`[data-content-id="${id}"]`);
    if (el) el.innerHTML = html;
  }
}

/* ---- Main init -------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
  const pageId    = (document.body.dataset.pageId || 'unknown') + (window.location.hash || '');
  const sessionId = getSessionId();
  const startTime = Date.now();

  const params = new URLSearchParams(window.location.search);
  let referralSource = null;
  for (const [key] of params) { referralSource = key; break; }
  if (referralSource) history.replaceState({}, '', window.location.pathname);

  const visitId = await helloPage(pageId, sessionId, referralSource);
  attachClickTracking(pageId, sessionId);
  attachDurationTracking(pageId, sessionId, startTime, visitId);
});
