import { useEffect } from 'react';

/** Client-router fallback; normal entry uses native links or server handoffs. */
export function LiveDestination({ url, label }: { url: string; label: string }) {
  const destination = new URL(url);
  if (!destination.search) destination.search = window.location.search;
  if (!destination.hash) destination.hash = window.location.hash;
  const target = destination.href;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return <p className="wrap"><a href={target}>Continue to {label}</a></p>;
}
