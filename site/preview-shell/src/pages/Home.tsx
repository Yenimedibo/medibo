import { useEffect } from 'react';
import { Link } from 'wouter';
import { EPISODES } from '../components/links';

const PROJECTS = [
  { verb: 'Learn', title: 'Courses', href: '/courses', line: 'Structured paths through subjects worth understanding properly. Currently: TALK TO AI — From Introduction to Mastery.' },
  { verb: 'Question', title: 'Reality 101', href: '/reality-101', line: 'Layers of Uncertainty. A video series that looks at what we know, and how sure we are allowed to be.' },
  { verb: 'Build', title: 'Workbench', href: '/workbench', line: 'A private place to think in writing. It runs in your own browser on the live site.' },
];

export default function Home() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  return (
    <div id="top">
      <section className="hero wrap" aria-labelledby="hero-title">
        <p className="kicker rise">Medibo / a personal space</p>
        <h1 id="hero-title" className="hero__title rise d1">
          I'm Mehdi<br />Bourkia.
        </h1>
        <div className="hero__body rise d2">
          <p className="lede">
            I build, study and document things that help me understand how technology, science, ideas and human systems work.
          </p>
          <div className="hero__cols">
            <p>This website is where those investigations become something tangible — courses, experiments, tools, videos and unfinished questions.</p>
            <p>Some projects are practical. Some are exploratory. Others may never arrive at a final answer.</p>
          </div>
          <p className="hero__goal">
            The goal is simple: <em>learn deeply, build useful things, and follow reality wherever it leads.</em>
          </p>
        </div>
      </section>

      <section id="work" className="wrap section" aria-labelledby="work-title">
        <div className="section__head">
          <p className="kicker">Index</p>
          <h2 id="work-title" className="h2">Four ways in</h2>
        </div>
        <ol className="projects">
          {PROJECTS.map((p, i) => (
            <li key={p.title} className="project">
              <Link href={p.href} className="project__link" data-testid={`card-project-${p.title.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="project__num">0{i + 1}</span>
                <span className="project__verb">{p.verb}</span>
                <span className="project__title">{p.title}</span>
                <span className="project__line">{p.line}</span>
                <span className="project__arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
          <li className="project project--teaser" data-testid="card-project-teaser">
            <div className="project__link" aria-label="Explore: an unnamed investigation">
              <span className="project__num">04</span>
              <span className="project__verb">Explore</span>
              <span className="project__title project__title--quiet">Untitled</span>
              <span className="project__line teaser-line">An investigation into the questions that refuse to disappear.</span>
              <span className="project__arrow" aria-hidden="true">·</span>
            </div>
          </li>
        </ol>
      </section>

      <section id="episodes" className="wrap section band" aria-labelledby="episodes-title">
        <div className="section__head">
          <p className="kicker">Reality 101 — Layers of Uncertainty</p>
          <h2 id="episodes-title" className="h2">Episodes</h2>
        </div>
        <ul className="eplist">
          {EPISODES.map((e) => (
            <li key={e.n}>
              <Link href={`/reality-101#episode-${e.n}`} className="eplist__item" data-testid={`link-episode-${e.n}`}>
                <span className="eplist__n">{String(e.n).padStart(2, '0')}</span>
                <span>{e.label}</span>
                <span className="eplist__go">Watch</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="journal" className="wrap section" aria-labelledby="journal-title">
        <div className="split">
          <div>
            <p className="kicker">Journal</p>
            <h2 id="journal-title" className="h2">Notes in progress</h2>
          </div>
          <p className="prose">
            This preview groups the work by project. Follow a project above for its existing materials.
          </p>
        </div>
      </section>

      <section id="about" className="wrap section" aria-labelledby="about-title">
        <div className="split">
          <div>
            <p className="kicker">About</p>
            <h2 id="about-title" className="h2">Medibo</h2>
          </div>
          <div className="prose">
            <p>Medibo is Mehdi Bourkia's personal space for learning, questioning and building useful things.</p>
            <p id="shop" className="muted">
              There is nothing for sale here. Course materials remain where they have always been, inside each course.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
