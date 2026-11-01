import { useEffect } from 'react';

/** Client-router fallback; normal entry uses native links or server handoffs. */
export function LiveDestination({ url, label }: { url: string; label: string }) {
  const target = `${url}${window.location.search}${window.location.hash}`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return <p className="wrap"><a href={target}>Continue to {label}</a></p>;
}
