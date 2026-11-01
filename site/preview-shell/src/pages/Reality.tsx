import { useEffect } from 'react';
import { PageHead } from '../components/Shell';
import { EPISODES } from '../components/links';

export const EPISODE_INFO: Record<number, { title: string; duration: string; description: string }> = {
  1: { title: 'An invitation to question', duration: '0:56', description: 'The introduction to Reality 101 — Layers of Uncertainty.' },
  2: { title: 'The person behind the questions', duration: '1:22', description: 'Mehdi introduces himself and the curiosity behind the series.' },
};

export default function Reality() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  return (
    <div className="wrap">
      <PageHead
        kicker="Question"
        title={<>Reality 101<span className="pagehead__dash"> — </span><em>Layers of Uncertainty</em></>}
        sub="We inherit explanations before we learn how to question them. Reality 101 is my ongoing attempt to slow down, separate observation from interpretation, and follow reality wherever it leads."
      >
        <blockquote className="slide__quote">No model is reality—not even Reality 101.</blockquote>
      </PageHead>
      <div className="episodes rise d2">
        {EPISODES.map((e) => {
          const info = EPISODE_INFO[e.n];
          return (
            <article key={e.n} id={`episode-${e.n}`} className="episode" aria-labelledby={`ep-${e.n}-title`}>
              <header className="episode__head">
                <span className="episode__n">{String(e.n).padStart(2, '0')}</span>
                <div>
                  <h2 id={`ep-${e.n}-title`} className="h2">{info?.title ?? e.label}</h2>
                  {info && <p className="episode__meta">{info.duration} · {info.description}</p>}
                </div>
              </header>
              <div className="frame">
                <video controls preload="none" playsInline poster={e.poster} data-testid={`video-episode-${e.n}`}>
                  <source src={e.src} type="video/mp4" />
                  Your browser cannot play this video. <a href={e.src}>Open {e.label}</a>.
                </video>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
