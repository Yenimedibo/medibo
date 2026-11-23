import { useAuth } from '@clerk/react';
import { useContext } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import { Link, useLocation } from 'wouter';
import { safeReturnTarget, signInPath } from '../lib/access';
import { ClerkConfigurationContext } from '../lib/ClerkConfiguration';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function ProjectAccessLink({ href, onClick, ...props }: Props) {
  const clerkConfigured = useContext(ClerkConfigurationContext);
  if (!clerkConfigured) {
    return <Link {...props} href={href.startsWith('https://') ? '/workbench' : href} onClick={onClick} />;
  }
  return <ClerkProjectAccessLink href={href} onClick={onClick} {...props} />;
}

function ClerkProjectAccessLink({ href, onClick, ...props }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const destination = safeReturnTarget(href);
  const external = href.startsWith('https://');
  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'] = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!isLoaded || !isSignedIn) {
      event.preventDefault();
      setLocation(signInPath(destination));
    }
  };

  return external
    ? <a {...props} href={href} onClick={handleClick} />
    : <Link {...props} href={href} onClick={handleClick} />;
}
