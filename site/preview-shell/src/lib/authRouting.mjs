const AUTHENTICATED_PATHS = [
  '/courses',
  '/talk-to-ai',
  '/reality-101',
  '/timeline-map',
  '/workbench',
  '/sign-in',
  '/sign-up',
  '/auth/continue',
];

export function appRouteMode(location, clerkConfigured) {
  const pathname = String(location ?? '/').split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const requiresClerk = AUTHENTICATED_PATHS.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!requiresClerk) return 'public';
  return clerkConfigured ? 'clerk' : 'auth-unavailable';
}
