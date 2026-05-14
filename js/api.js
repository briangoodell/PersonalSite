/* ============================================================
   DJANGO API INTEGRATION
   ============================================================
   Handles three things:
     1. Visitor & event tracking (visits, clicks, time-on-page)
     2. Dynamic content overrides fetched from the API
     3. Graceful fallback to defaults when API is unavailable

   HOW TO ENABLE:
     1. Set API_BASE_URL to your Django server URL
     2. Set PAGE_TRACKING_ENABLED to true
     3. Your Django API must have CORS configured to allow
        your GitHub Pages domain.

   SECURITY NOTE (for Django side):
     Content served from /api/content/{pageId} is injected via
     innerHTML. Always sanitize with bleach.clean() before
     storing or serving content to prevent XSS.
   ============================================================ */

const API_BASE_URL          = '';    // e.g. 'https://api.yourdomain.com'
const PAGE_TRACKING_ENABLED = false; // Set true when Django is live
const CONTENT_FETCH_TIMEOUT = 1500;  // ms — fall back to defaults after this

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

/* ---- Visit tracking --------------------------------------- */

function trackPageVisit(pageId, sessionId) {
  return trackPost('/api/visits', {
    pageId,
    sessionId,
    timestamp: new Date().toISOString(),
    referrer:  document.referrer || null,
    userAgent: navigator.userAgent,
  });
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
    trackPost('/api/events', {
      type:      'click',
      target:    href,
      pageId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  });
}

/* ---- Duration tracking (sendBeacon on unload) ------------- */

function attachDurationTracking(pageId, sessionId, startTime) {
  if (!API_BASE_URL || !PAGE_TRACKING_ENABLED) return;
  window.addEventListener('beforeunload', () => {
    const seconds = Math.round((Date.now() - startTime) / 1000);
    const payload = JSON.stringify({ type: 'duration', seconds, pageId, sessionId });
    // Blob + explicit type required so Django's JSONParser accepts the request
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${API_BASE_URL}/api/events`,
        new Blob([payload], { type: 'application/json' })
      );
    } else {
      try {
        fetch(`${API_BASE_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      } catch (_) { /* silent */ }
    }
  });
}

/* ---- Dynamic content fetch -------------------------------- */

async function fetchPageContent(pageId) {
  if (!API_BASE_URL) return {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT);
  try {
    const resp = await fetch(`${API_BASE_URL}/api/content/${pageId}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return {};
    return await resp.json();
  } catch (_) {
    clearTimeout(timer);
    return {};
  }
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
  const pageId    = document.body.dataset.pageId || 'unknown';
  const sessionId = getSessionId();
  const startTime = Date.now();

  trackPageVisit(pageId, sessionId);
  attachClickTracking(pageId, sessionId);
  attachDurationTracking(pageId, sessionId, startTime);

  const content = await fetchPageContent(pageId);
  if (content.sections) {
    applyContentOverrides(content.sections);
  }
});
