import express from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { publishableKeyFromHost } from '@clerk/shared/keys';
import { getClerkProxyHost, CLERK_PROXY_PATH, clerkProxyMiddleware } from './clerkProxyMiddleware.mjs';
import { handoffMiddleware, isCourseEntryPath } from '../compatibility.mjs';
import { getTimelineResponse } from './timelineData.mjs';

const protectedPagePaths = new Set(['/courses', '/timeline-map', '/workbench']);

function requestPath(req) {
  try {
    return new URL(req.originalUrl || req.url || '/', 'http://preview.invalid').pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

function isAuthRelevant(req) {
  const path = requestPath(req);
  if (path && (isCourseEntryPath(path) || path === '/reality-101')) return false;
  return path === null || protectedPagePaths.has(path) || path === '/api' || path?.startsWith('/api/timeline-map') ||
    path?.startsWith('/courses') || path?.startsWith('/reality-101') ||
    path?.startsWith('/timeline-map') || path?.startsWith('/workbench') || path?.startsWith('/sign-in') ||
    path?.startsWith('/sign-up');
}

function isAllowedPage(path) {
  return (
    path === '/' || path === '/courses' || path === '/reality-101' ||
    path === '/timeline-map' || path === '/workbench' || path === '/sign-in' || path === '/sign-up' ||
    path === '/account-help' || path === '/auth/continue' ||
    isCourseEntryPath(path) ||
    path.startsWith('/sign-in/') || path.startsWith('/sign-up/')
  );
}

function noIndex(req, res, next) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}

function requireSignedIn(req, res, next) {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  req.mediboUserId = userId;
  next();
}

export function createPreviewApp({ staticDirectory, fallthrough = false } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(noIndex);
  app.use((req, res, next) => {
    if (protectedPagePaths.has(requestPath(req)) && req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      res.status(405).end();
      return;
    }
    next();
  });
  app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
  app.use((req, res, next) => {
    if (!isAuthRelevant(req)) return next();
    if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      res.status(503).type('text/plain').send('Authentication is not configured for this preview.');
      return;
    }
    return clerkMiddleware((clerkReq) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(clerkReq) ?? '',
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    }))(req, res, next);
  });

  app.get('/api/timeline-map/access', requireSignedIn, (req, res) => {
    const editorIds = new Set(
      String(process.env.MEDIBO_EDITOR_USER_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    );
    res.json({ canPreviewDrafts: editorIds.has(req.mediboUserId) });
  });

  app.get('/api/timeline-map', requireSignedIn, async (req, res) => {
    try {
      const result = await getTimelineResponse({ userId: req.mediboUserId, query: req.query });
      if (result.status === 403) {
        res.status(403).json({ error: 'Editor preview access is not enabled for this account.' });
        return;
      }
      res.json(result);
    } catch {
      res.status(503).json({
        status: 'error',
        lastSyncedAt: null,
        refreshSeconds: 60,
        events: [],
        context: [],
        methodology: [],
        canPreviewDrafts: false,
        message: 'The spreadsheet is temporarily unavailable. Try again later.',
      });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  app.use((req, res, next) => {
    const path = requestPath(req);
    if (!path) {
      res.status(400).type('text/plain').send('Bad request.');
      return;
    }
    if (!protectedPagePaths.has(path)) return next();
    if (getAuth(req).userId) return next();
    const returnTo = `${path}${req.originalUrl?.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : ''}`;
    res.redirect(307, `/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  });

  app.use((req, res, next) => {
    const path = requestPath(req);
    if (path !== '/workbench') return next();
    handoffMiddleware(req, res, next);
  });

  if (staticDirectory) {
    app.use(express.static(staticDirectory, { fallthrough: true, index: false, maxAge: 0 }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        res.status(405).end();
        return;
      }
      const path = requestPath(req);
      if (path?.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found.' });
        return;
      }
      if (isAllowedPage(path)) {
        res.sendFile('index.html', { root: staticDirectory });
        return;
      }
      next();
    });
  } else if (fallthrough) {
    app.use((_req, _res, next) => next());
  } else {
    app.use((req, res) => {
      res.status(404).type('text/plain').send('Not found.');
    });
  }

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(500).type('text/plain').send('Unable to serve this preview request.');
  });
  return app;
}
