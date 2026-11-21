import { SignIn, SignUp, useAuth } from '@clerk/react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LIVE } from './links';
import { safeReturnTarget, signInPath } from '../lib/access';
import './AuthPages.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function returnTargetFromLocation() {
  return safeReturnTarget(new URLSearchParams(window.location.search).get('returnTo'));
}

function continuePath(target: string) {
  return `${basePath}/auth/continue?returnTo=${encodeURIComponent(target)}`;
}

function AuthDialog({ children, title }: { children: ReactNode; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <main className="auth-screen">
      <dialog
        ref={dialogRef}
        className="auth-dialog"
        aria-labelledby="auth-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          setLocation('/');
        }}
      >
        <div className="auth-dialog__top">
          <Link href="/" className="auth-dialog__brand" data-testid="link-auth-home">Medibo.</Link>
          <button
            type="button"
            className="auth-dialog__close"
            aria-label="Close sign-in"
            onClick={() => setLocation('/')}
            data-testid="button-auth-close"
          >
            Close
          </button>
        </div>
        <h1 id="auth-dialog-title" className="auth-dialog__heading">{title}</h1>
        {children}
        <nav className="auth-dialog__help" aria-label="Account and privacy information">
          <Link href="/account-help" data-testid="link-account-help">Account assistance</Link>
          <a href={LIVE.privacy} data-testid="link-auth-privacy">Privacy &amp; storage</a>
        </nav>
      </dialog>
    </main>
  );
}

export function SignInPage() {
  const target = useMemo(returnTargetFromLocation, []);
  return (
    <AuthDialog title="Sign in or create an account">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up?returnTo=${encodeURIComponent(target)}`}
        forceRedirectUrl={continuePath(target)}
        fallbackRedirectUrl={continuePath(target)}
      />
    </AuthDialog>
  );
}

export function SignUpPage() {
  const target = useMemo(returnTargetFromLocation, []);
  return (
    <AuthDialog title="Create a free account">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in?returnTo=${encodeURIComponent(target)}`}
        forceRedirectUrl={continuePath(target)}
        fallbackRedirectUrl={continuePath(target)}
      />
    </AuthDialog>
  );
}

export function AuthContinuePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const target = useMemo(returnTargetFromLocation, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLocation(signInPath(target));
      return;
    }
    if (/^https:\/\/bourkia\.com\//.test(target)) {
      window.location.replace(target);
    } else {
      setLocation(target);
    }
  }, [isLoaded, isSignedIn, setLocation, target]);

  return <p className="auth-continue" role="status">Returning to your project…</p>;
}

export function AccountHelpPage() {
  return (
    <div className="account-help wrap">
      <p className="kicker">Account assistance</p>
      <h1 className="pagehead__title">Need help signing in?</h1>
      <p className="prose">
        Use the recovery option on the sign-in form for email accounts. If you sign in with Google,
        recover access through Google.
      </p>
      <p className="prose">
        For privacy and browser-storage information, read the public Privacy &amp; storage page.
      </p>
      <a href={LIVE.privacy} className="slide__link" data-testid="link-account-help-privacy">
        Privacy &amp; storage <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
