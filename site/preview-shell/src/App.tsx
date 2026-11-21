import { ClerkProvider, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { Component, useEffect, type ReactNode } from 'react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthContinuePage, AccountHelpPage, SignInPage, SignUpPage } from './components/AuthPages';
import { LiveDestination } from './components/LiveDestination';
import { Shell } from './components/Shell';
import { LIVE } from './components/links';
import { safeReturnTarget, signInPath } from './lib/access';
import { appRouteMode } from './lib/authRouting.mjs';
import { ClerkConfigurationContext } from './lib/ClerkConfiguration';
import Courses from './pages/Courses';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Reality from './pages/Reality';
import TimelineMap from './pages/TimelineMap';
import Workbench from './pages/Workbench';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const initialRoutePath = window.location.pathname.startsWith(basePath)
  ? window.location.pathname.slice(basePath.length) || '/'
  : window.location.pathname;
const initialCourseHash = ['/talk-to-ai', '/courses/talk-to-ai'].includes(
  initialRoutePath.replace(/\/+$/, '') || '/',
)
  ? window.location.hash
  : '';
const initialRealityHash = (initialRoutePath.replace(/\/+$/, '') || '/') === '/reality-101'
  ? window.location.hash
  : '';
const configuredClerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
const clerkPubKey = configuredClerkPubKey
  ? publishableKeyFromHost(window.location.hostname, configuredClerkPubKey)
  : undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const clerkAppearance = {
  theme: 'simple' as const,
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/favicon.svg`,
  },
  variables: {
    colorPrimary: '#9c3b23',
    colorForeground: '#1d2230',
    colorMutedForeground: '#4c5160',
    colorBackground: '#f2ede3',
    colorInput: '#fffdf8',
    colorInputForeground: '#1d2230',
    colorDanger: '#8b1e14',
    colorNeutral: '#1d2230',
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
    borderRadius: '2px',
  },
  elements: {
    cardBox: { width: '100%', maxWidth: '27rem', margin: '0 auto' },
    card: { backgroundColor: 'transparent', border: '0', boxShadow: 'none' },
    footer: { backgroundColor: 'transparent', border: '0', boxShadow: 'none' },
    headerTitle: { color: '#1d2230' },
    headerSubtitle: { color: '#4c5160' },
    socialButtonsBlockButtonText: { color: '#1d2230' },
    formFieldLabel: { color: '#1d2230' },
    formFieldInput: { color: '#1d2230', backgroundColor: '#fffdf8' },
    footerActionText: { color: '#4c5160' },
    footerActionLink: { color: '#2a3a6b' },
    dividerText: { color: '#4c5160' },
    alertText: { color: '#8b1e14' },
    formButtonPrimary: { color: '#fffdf8', backgroundColor: '#1d2230' },
  },
};

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

function ProtectedPage({ destination, children }: { destination: string; children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation(signInPath(destination));
  }, [destination, isLoaded, isSignedIn, setLocation]);

  if (!isLoaded || !isSignedIn) return <p className="auth-continue" role="status">Checking access…</p>;
  return children;
}

function CourseRoute() {
  return <ProtectedPage destination="/courses"><Courses /></ProtectedPage>;
}

function RealityRoute() {
  const destination = safeReturnTarget('/reality-101', initialRealityHash || window.location.hash);
  return <ProtectedPage destination={destination}><Reality /></ProtectedPage>;
}

function TimelineRoute() {
  return <ProtectedPage destination="/timeline-map"><TimelineMap /></ProtectedPage>;
}

function WorkbenchRoute() {
  return <ProtectedPage destination="/workbench"><Workbench /></ProtectedPage>;
}

function CourseHandoffRoute() {
  const destination = safeReturnTarget(LIVE.talkToAi, initialCourseHash || window.location.hash);
  return (
    <ProtectedPage destination={destination}>
      <LiveDestination url={destination} label="TALK TO AI course" />
    </ProtectedPage>
  );
}

function SiteRoutes() {
  return (
    <ClerkShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/courses" component={CourseRoute} />
        <Route path="/talk-to-ai" component={CourseHandoffRoute} />
        <Route path="/talk-to-ai/" component={CourseHandoffRoute} />
        <Route path="/courses/talk-to-ai" component={CourseHandoffRoute} />
        <Route path="/courses/talk-to-ai/" component={CourseHandoffRoute} />
        <Route path="/reality-101" component={RealityRoute} />
        <Route path="/timeline-map" component={TimelineRoute} />
        <Route path="/workbench" component={WorkbenchRoute} />
        <Route path="/workbench/" component={WorkbenchRoute} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/privacy/" component={Privacy} />
        <Route path="/account-help" component={AccountHelpPage} />
        <Route component={NotFound} />
      </Switch>
    </ClerkShell>
  );
}

function ClerkShell({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const authState = !isLoaded ? 'loading' : isSignedIn ? 'signed-in' : 'signed-out';
  return (
    <Shell
      authState={authState}
      onSignOut={() => { void signOut({ redirectUrl: '/' }); }}
    >
      {children}
    </Shell>
  );
}

function ProviderRoutes() {
  const [, setLocation] = useLocation();
  const signInUrl = `${basePath}/sign-in`;
  const signUpUrl = `${basePath}/sign-up`;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      telemetry={false}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/auth/continue" component={AuthContinuePage} />
        <Route component={SiteRoutes} />
      </Switch>
    </ClerkProvider>
  );
}

function PublicRoutes() {
  return (
    <ClerkConfigurationContext.Provider value={false}>
      <Shell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/privacy/" component={Privacy} />
          <Route path="/account-help" component={AccountHelpPage} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </ClerkConfigurationContext.Provider>
  );
}

function AuthUnavailablePage() {
  return (
    <section className="account-help wrap" aria-labelledby="auth-unavailable-title">
      <p className="kicker">Protected project</p>
      <h1 className="pagehead__title" id="auth-unavailable-title">Sign-in is unavailable</h1>
      <p className="prose">
        Authentication is not configured or is temporarily unavailable. This project remains locked;
        please try again later.
      </p>
    </section>
  );
}

class ClerkAvailabilityBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function AppRoutes() {
  const [location] = useLocation();
  const mode = appRouteMode(location, Boolean(clerkPubKey));
  if (!clerkPubKey) {
    if (mode === 'public') return <PublicRoutes />;
    return <Shell><AuthUnavailablePage /></Shell>;
  }
  const fallback = mode === 'public'
    ? <PublicRoutes />
    : <Shell><AuthUnavailablePage /></Shell>;
  return (
    <ClerkAvailabilityBoundary fallback={fallback}>
      <ProviderRoutes />
    </ClerkAvailabilityBoundary>
  );
}

function App() {
  return (
    <ClerkConfigurationContext.Provider value={Boolean(clerkPubKey)}>
      <WouterRouter base={basePath}>
        <AppRoutes />
      </WouterRouter>
    </ClerkConfigurationContext.Provider>
  );
}

export default App;
