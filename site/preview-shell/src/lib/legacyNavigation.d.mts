export type LegacyNavigationDecision =
  | { kind: 'redirect'; target: string }
  | { kind: 'unavailable'; reason: string };

export declare function legacyNavigationDecision(
  rawDestination: string,
  currentUrl: string,
): LegacyNavigationDecision;
