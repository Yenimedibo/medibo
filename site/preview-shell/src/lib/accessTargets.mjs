const INTERNAL_PROJECT_PATHS = new Set([
  '/courses',
  '/reality-101',
  '/timeline-map',
  '/workbench',
]);
const LIVE_PROJECT_PATHS = new Set(['/workbench', '/talk-to-ai']);
const COURSE_HASH_ROUTES = new Set([
  'home',
  ...Array.from({ length: 24 }, (_, index) => String(index + 1).padStart(2, '0')),
  'studio',
  'practice',
  'lab-research',
  'lab-files',
  'lab-data',
  'lab-creative',
  'lab-content',
  'lab-automation',
  'resources',
  'sources',
  'prompts',
  'quickrefs',
  'glossary',
  'agents',
  'advanced',
  'paths',
  'capstone',
  'workflow-check',
]);

function safeEpisodeHash(hash) {
  return /^#episode-[12]$/.test(hash) ? hash : '';
}

function safeCourseHash(hash) {
  const match = /^#(en|dar)\/([a-z0-9-]+)$/i.exec(hash);
  if (!match || !COURSE_HASH_ROUTES.has(match[2].toLowerCase())) return '';
  return `#${match[1].toLowerCase()}/${match[2].toLowerCase()}`;
}

/**
 * @param {string | null | undefined} value
 * @param {string} currentOrigin
 * @param {string} [inheritedHash]
 * @returns {string}
 */
export function safeReturnTarget(value, currentOrigin, inheritedHash = '') {
  if (!value) return '/';
  try {
    if (value.startsWith('//')) return '/';
    const url = new URL(value, currentOrigin);
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    if (url.origin === currentOrigin && INTERNAL_PROJECT_PATHS.has(pathname)) {
      const hash = pathname === '/reality-101'
        ? safeEpisodeHash(url.hash) || safeEpisodeHash(inheritedHash)
        : '';
      return `${pathname}${hash}`;
    }
    if (url.origin === 'https://bourkia.com' && LIVE_PROJECT_PATHS.has(pathname)) {
      const hash = pathname === '/talk-to-ai'
        ? safeCourseHash(url.hash) || safeCourseHash(inheritedHash)
        : '';
      return `${url.origin}${pathname}${hash}`;
    }
  } catch {
    return '/';
  }
  return '/';
}

/**
 * @param {string} returnTo
 * @param {string} currentOrigin
 * @returns {string}
 */
export function signInPath(returnTo, currentOrigin) {
  return `/sign-in?returnTo=${encodeURIComponent(safeReturnTarget(returnTo, currentOrigin))}`;
}
