import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LIVE } from './links';
import { ProjectAccessLink } from './ProjectAccessLink';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/reality-101', label: 'Reality 101' },
  { href: '/timeline-map', label: 'Timeline Map' },
  { href: LIVE.workbench, label: 'Workbench' },
];

type ShellAuthState = 'none' | 'loading' | 'signed-out' | 'signed-in';

export function Shell({
  children,
  authState = 'none',
  onSignOut,
}: {
  children: ReactNode;
  authState?: ShellAuthState;
  onSignOut?: () => void;
}) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const previousLocation = useRef(loc);

  useEffect(() => {
    setOpen(false);
    const changed = previousLocation.current !== loc;
    previousLocation.current = loc;
    const meta: Record<string, [string, string]> = {
      '/': ['Mehdi Bourkia — Medibo', 'Mehdi Bourkia\'s personal space for learning deeply, building useful things and following reality wherever it leads.'],
      '/courses': ['Courses — Medibo', 'Free courses by Mehdi Bourkia, starting with TALK TO AI — From Introduction to Mastery, in English and Darija.'],
      '/reality-101': ['Reality 101 — Layers of Uncertainty — Medibo', 'An ongoing attempt to slow down, separate observation from interpretation, and follow reality wherever it leads.'],
      '/timeline-map': ['The Timeline Map — Medibo', 'A historical map that keeps sources, geographic evidence and uncertainty visible.'],
      '/workbench': ['Workbench — Medibo', 'Capture claims, formalize hypotheses, log evidence, and expose every assumption.'],
      '/privacy': ['Privacy & storage — Medibo', 'How Medibo handles privacy and storage.'],
      '/account-help': ['Account assistance — Medibo', 'Help with recovering access to a Medibo account.'],
    };
    const [title, desc] = meta[loc] || ['Page not found — Medibo', 'This address does not lead anywhere on Medibo.'];
    document.title = title;
    for (const [property, content] of [
      ['og:title', title],
      ['og:description', desc],
      ['og:type', 'website'],
    ]) {
      let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    }
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = desc;
    if (changed) requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView();
      else {
        window.scrollTo(0, 0);
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }
    });
  }, [loc]);

  return (
    <>
      <a className="skip" href="#main-content">Skip to content</a>
      <header className="masthead">
        <div className="masthead__inner">
          <Link href="/" className="wordmark" data-testid="link-home-wordmark">
            Medibo<span className="wordmark__dot">.</span>
          </Link>
          <button
            className="navtoggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
            data-testid="button-nav-toggle"
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className={`nav ${open ? 'is-open' : ''}`} aria-label="Primary" onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              document.querySelector<HTMLButtonElement>('.navtoggle')?.focus();
            }
          }}>
            {NAV.map((n, i) => {
              const active = n.href === '/' ? loc === '/' : n.href.startsWith('https://')
                ? loc.startsWith('/workbench')
                : loc.startsWith(n.href);
              const href = authState === 'none' && n.href.startsWith('https://') ? '/workbench' : n.href;
              const LinkComponent = n.href === '/'
                ? Link
                : authState === 'none'
                  ? Link
                  : ProjectAccessLink;
              return (
                <LinkComponent
                  key={n.href}
                  href={href}
                  className="nav__link"
                  aria-current={active ? 'page' : undefined}
                  data-testid={`link-nav-${n.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className="nav__num">0{i}</span>
                  {n.label}
                </LinkComponent>
              );
            })}
            {authState === 'signed-in' && onSignOut && (
              <button className="nav__link nav__account" type="button" onClick={onSignOut} data-testid="button-sign-out">Sign out</button>
            )}
            {authState === 'signed-out' && (
              <Link href="/sign-in?returnTo=%2F" className="nav__link nav__account" data-testid="link-sign-in"><span className="nav__num">+</span>Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__sig">Medibo — Mehdi Bourkia.<br />Learn, question, build, explore.</p>
          <ul className="footer__links">
            <li><a href={LIVE.privacy} data-testid="link-footer-privacy">Privacy &amp; storage</a></li>
            <li><Link href="/account-help" data-testid="link-footer-account-help">Account assistance</Link></li>
            <li><a href="https://bourkia.com/" data-testid="link-footer-live">bourkia.com</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}

export function PageHead({ kicker, title, sub, children }: { kicker: string; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="pagehead rise">
      <p className="kicker">{kicker}</p>
      <h1 className="pagehead__title">{title}</h1>
      {sub && <p className="pagehead__sub">{sub}</p>}
      {children}
    </header>
  );
}
