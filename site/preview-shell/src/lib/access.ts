import {
  safeReturnTarget as resolveSafeReturnTarget,
  signInPath as buildSignInPath,
} from './accessTargets.mjs';

export function safeReturnTarget(value: string | null | undefined, inheritedHash?: string): string {
  return resolveSafeReturnTarget(
    value,
    window.location.origin,
    inheritedHash ?? window.location.hash,
  );
}

export function signInPath(returnTo: string): string {
  return buildSignInPath(returnTo, window.location.origin);
}
