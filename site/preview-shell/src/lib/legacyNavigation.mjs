/** Pure, browser-independent legacy handoff decision. No real browser data is used in tests. */
export function legacyNavigationDecision(rawDestination, currentUrl) {
  let current;
  let target;
  try {
    current = new URL(currentUrl);
    target = new URL(rawDestination, current);
  } catch { return { kind: 'unavailable', reason: 'Invalid legacy destination.' }; }
  if (target.protocol !== 'https:') {
    return { kind: 'unavailable', reason: 'A legacy destination must use HTTPS.' };
  }
  if (!target.search) target.search = current.search;
  if (!target.hash) target.hash = current.hash;
  if (target.origin === current.origin) {
    return { kind: 'unavailable', reason: 'Legacy content is not yet hosted on this origin.' };
  }
  return { kind: 'redirect', target: target.href };
}
