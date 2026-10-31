import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from './components/Shell';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Reality from './pages/Reality';
import Workbench from './pages/Workbench';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/courses" component={Courses} />
          <Route path="/reality-101" component={Reality} />
          <Route path="/workbench" component={Workbench} />
          <Route path="/privacy" component={Privacy} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </WouterRouter>
  );
}

export default App;
