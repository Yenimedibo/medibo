import { useEffect } from 'react';
import { legacyNavigationDecision } from '../lib/legacyNavigation.mjs';

/** Client-router fallback only; server protects actual project routes. */
export function LiveDestination({ url, label }: { url: string; label: string }) {
  const navigation = legacyNavigationDecision(url, window.location.href);

  useEffect(() => {
    if (navigation.kind === 'redirect') window.location.replace(navigation.target);
  }, [navigation.kind, navigation.kind === 'redirect' ? navigation.target : '']);

  if (navigation.kind !== 'redirect') {
    return (
      <section className="wrap" role="alert" data-testid="legacy-handoff-blocked">
        <h1>{label} is not yet available on this website</h1>
        <p>The existing content must be migrated and tested before this route can be enabled.</p>
        <a href="/">Return to Home</a>
      </section>
    );
  }

  return <p className="wrap"><a href={navigation.target}>Continue to {label}</a></p>;
}
