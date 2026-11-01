import { useEffect } from 'react';
import { Link } from 'wouter';
import { EPISODES, LIVE } from '../components/links';
import { Slides } from '../components/Slides';
import { EPISODE_INFO } from './Reality';

const SLIDES = [
  {
    key: 'courses', label: 'Learn — Courses',
    content: (
      <article className="slide">
        <p className="slide__verb">Learn</p>
        <h3 className="slide__title">Courses</h3>
        <div className="slide__body">
          <p className="slide__lead">TALK TO AI — <em>From Introduction to Mastery.</em></p>
          <dl className="facts">
            <div><dt>Foundation lessons</dt><dd>24</dd></div>
            <div><dt>Applied workshops</dt><dd>6</dd></div>
            <div><dt>Languages</dt><dd>English + Darija</dd></div>
          </dl>
          <p>Free to read and download. No payment, no enrollment.</p>
          <Link href="/courses" className="slide__link" data-testid="link-slide-courses">See the courses <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    ),
  },
  {
    key: 'reality', label: 'Question — Reality 101',
    content: (
      <article className="slide">
        <p className="slide__verb">Question</p>
        <h3 className="slide__title">Reality 101</h3>
        <div className="slide__body">
          <p className="slide__lead">We inherit explanations before we learn how to question them.</p>
          <p>Reality 101 is my ongoing attempt to slow down, separate observation from interpretation, and follow reality wherever it leads.</p>
          <blockquote className="slide__quote">No model is reality—not even Reality 101.</blockquote>
          <Link href="/reality-101" className="slide__link" data-testid="link-slide-reality">Watch the episodes <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    ),
  },
  {
    key: 'workbench', label: 'Build — Workbench',
    content: (
      <article className="slide">
        <p className="slide__verb">Build</p>
        <h3 className="slide__title">Workbench</h3>
        <div className="slide__body">
          <ol className="steps">
            <li>Capture claims</li><li>Formalize hypotheses</li><li>Log evidence</li><li>Expose every assumption</li>
          </ol>
          <p>Capture claims, formalize hypotheses, log evidence, and expose every assumption. Your entries stay in this browser.</p>
          <a href={LIVE.workbench} className="slide__link" data-testid="link-slide-workbench">Open the Workbench <span aria-hidden="true">→</span></a>
        </div>
      </article>
    ),
  },
  {
    key: 'explore', label: 'Explore — unnamed investigation',
    content: (
      <article className="slide slide--quiet">
        <p className="slide__verb">Explore</p>
        <h3 className="slide__title"><em>Untitled</em></h3>
        <div className="slide__body">
          <p className="slide__lead">An investigation into the questions that refuse to disappear.</p>
        </div>
      </article>
    ),
  },
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
        <div id="journal" className="hero__body rise d2">
          <p className="lede">
            I build, study and document things that help me understand how technology, science, ideas and human systems work.
          </p>
          <div className="hero__cols">
            <p>This website is where those investigations become something tangible — courses, experiments, tools, videos and unfinished questions.</p>
            <p>Some projects are practical. Some are exploratory. Others may never arrive at a final answer.</p>
          </div>
        </div>
      </section>

      <section id="about" className="wrap section" aria-labelledby="about-title">
        <div className="split">
          <div>
            <p className="kicker">About</p>
            <h2 id="about-title" className="h2">Who is asking</h2>
          </div>
          <div className="prose">
            <p>I'm Mehdi Bourkia—a Moroccan aviation technician, father, and independent creator. My work moves between engineering and imagination, evidence and meaning, the technical world and the human one.</p>
            <p className="pull">I'm not here to preach answers. I'm here to share the journey.</p>
          </div>
        </div>
        <ol className="goals" aria-label="Goals">
          <li><span>i.</span> Learn deeply</li>
          <li><span>ii.</span> Build useful things</li>
          <li><span>iii.</span> Follow reality wherever it leads</li>
        </ol>
      </section>

      <section id="work" className="wrap section" aria-labelledby="work-title">
        <div className="section__head">
          <p className="kicker">Index</p>
          <h2 id="work-title" className="h2">Four ways in</h2>
        </div>
        <div id="shop">
          <Slides slides={SLIDES} label="Four ways in" />
        </div>
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
                <span>{EPISODE_INFO[e.n]?.title ?? e.label}</span>
                <span className="eplist__go">{EPISODE_INFO[e.n]?.duration} · Watch</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
