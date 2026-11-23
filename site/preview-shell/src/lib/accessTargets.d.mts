export function safeReturnTarget(
  value: string | null | undefined,
  currentOrigin: string,
  inheritedHash?: string,
): string;

export function signInPath(returnTo: string, currentOrigin: string): string;
