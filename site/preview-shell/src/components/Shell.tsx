import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/reality-101', label: 'Reality 101' },
  { href: '/workbench', label: 'Workbench' },
];

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const previousLocation = useRef(loc);

  useEffect(() => {
    setOpen(false);
    const changed = previousLocation.current !== loc;
    previousLocation.current = loc;
    const titles: Record<string, string> = {
      '/': 'Mehdi Bourkia',
      '/courses': 'Courses',
      '/reality-101': 'Reality 101 — Layers of Uncertainty',
      '/workbench': 'Workbench — live-site entry',
      '/privacy': 'Privacy & storage',
    };
    document.title = `${titles[loc] || 'Page not found'} | Medibo preview`;
    for (const [property, content] of [
      ['og:title', document.title],
      ['og:description', 'Preview-only personal website shell. Production remains at bourkia.com.'],
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
    if (description) description.content = `${titles[loc] || 'Page not found'} — Medibo's preview-only website. Production remains at bourkia.com.`;
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
              const active = n.href === '/' ? loc === '/' : loc.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="nav__link"
                  aria-current={active ? 'page' : undefined}
                  data-testid={`link-nav-${n.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className="nav__num">0{i}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__sig">Medibo — Mehdi Bourkia.<br />Learn, question, build, explore.</p>
          <ul className="footer__links">
            <li><Link href="/privacy" data-testid="link-footer-privacy">Privacy &amp; storage</Link></li>
            <li><a href="https://bourkia.com/" data-testid="link-footer-live">bourkia.com</a></li>
          </ul>
          <p className="footer__note">Staging preview · noindex requested · no application storage or analytics.</p>
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
