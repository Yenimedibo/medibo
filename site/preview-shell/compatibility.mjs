/**
 * Preview-only handoffs of legacy Medibo assets. No legacy course, media or
 * visitor data is proxied. The legacy origin must never be its own target.
 *
 * This file preserves the public API of the existing compatibility.mjs so it
 * can replace that file in PR #5 without changing its callers.
 */
export const PRODUCTION_ORIGIN = 'https://bourkia.com';
const LEGACY_HOST = new URL(PRODUCTION_ORIGIN).hostname;
const courseEntryPaths = new Set(['/talk-to-ai', '/courses/talk-to-ai']);

export function isCourseEntryPath(pathname) {
  return courseEntryPaths.has(pathname.replace(/\/+$/, '') || '/');
}

/** Resolve a host without trusting proxy-supplied forwarding headers. */
function normalizedHost(raw) {
  if (!raw) return '';
  try {
    const candidate = String(raw).trim();
    const url = new URL(candidate.includes('://') ? candidate : `http://${candidate}`);
    return url.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  } catch { return ''; }
}

/** Whether the requested path is currently a legacy handoff path. */
export function legacyPath(rawUrl) {
  const url = new URL(rawUrl, 'http://preview.invalid');
  const path = url.pathname;
  const isCourse = path === '/talk-to-ai' || path === '/talk-to-ai/' ||
    path === '/courses/talk-to-ai' || path.startsWith('/courses/talk-to-ai/');
  const isExistingMedia = /^\/media\/reality-101-ep[12]\.(mp4|jpg)$/.test(path);
  const isLiveFeature = /^\/(workbench|privacy)\/?$/.test(path);
  return (isCourse || isExistingMedia || isLiveFeature) ? `${path}${url.search}` : null;
}

/** Backwards-compatible URL calculator used in the existing staging tests. */
export function productionHandoff(rawUrl) {
  const path = legacyPath(rawUrl);
  return path ? `${PRODUCTION_ORIGIN}${path}` : null;
}

/**
 * For a self-origin legacy handoff, return unavailable, never 307 to self.
 * MEDIBO_SITE_ORIGIN provides an explicit same-origin rehearsal switch without
 * touching bourkia.com. A Host-header match also blocks self-handoffs.
 */
export function resolveLegacyHandoff(rawUrl, { host = '', siteOrigin = '' } = {}) {
  const target = productionHandoff(rawUrl);
  if (!target) return { kind: 'pass' };
  const ownHost = normalizedHost(host);
  const configuredHost = normalizedHost(siteOrigin);
  const legacyHost = normalizedHost(LEGACY_HOST);
  if (ownHost === legacyHost || configuredHost === legacyHost) {
    return { kind: 'unavailable', reason: 'Legacy asset has not been safely migrated into this site.' };
  }
  return { kind: 'redirect', target };
}

function securityHeaders(res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

export function handoffMiddleware(req, res, next) {
  let outcome;
  try {
    outcome = resolveLegacyHandoff(req.url || '/', {
      host: req.headers?.host ?? '',
      siteOrigin: process.env.MEDIBO_SITE_ORIGIN ?? '',
    });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    // Avoid requiring setHeader on lightweight HTTP response test doubles.
    res.writeHead(400, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : 'Bad request.');
    return;
  }
  if (outcome.kind === 'pass') return next();
  securityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : 'Legacy handoffs accept read requests only.');
    return;
  }
  if (outcome.kind === 'unavailable') {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '3600' });
    res.end(req.method === 'HEAD' ? undefined : 'This legacy feature is not ready on this origin. The existing live content must be preserved before cutover.');
    return;
  }
  // Fragment is absent by design: browsers retain incoming fragments on 307.
  res.writeHead(307, { Location: outcome.target });
  res.end();
}

export function compatibilityPlugin() {
  const isWorkbenchPath = req => {
    try { return /^\/workbench\/?$/.test(new URL(req.url || '/', 'http://preview.invalid').pathname); }
    catch { return false; }
  };
  const isProtectedEntryPath = req => {
    try {
      return isWorkbenchPath(req) ||
        isCourseEntryPath(new URL(req.url || '/', 'http://preview.invalid').pathname);
    } catch { return false; }
  };
  function installBeforeConnect(server) {
    const middleware = server.middlewares;
    const handle = middleware.handle;
    middleware.handle = function (req, res, next) {
      if (isProtectedEntryPath(req)) return handle.call(middleware, req, res, next);
      return handoffMiddleware(req, res, () => handle.call(middleware, req, res, next));
    };
  }
  return {
    name: 'medibo-preview-contract-handoffs',
    configureServer: installBeforeConnect,
    configurePreviewServer: installBeforeConnect,
  };
}
