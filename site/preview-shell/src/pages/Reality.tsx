import { useEffect } from 'react';
import { PageHead } from '../components/Shell';
import { EPISODES } from '../components/links';

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
        sub="A video series about how we come to know things — and about the layers of uncertainty that sit underneath what seems obvious."
      />
      <div className="episodes rise d2">
        {EPISODES.map((e) => (
          <article key={e.n} id={`episode-${e.n}`} className="episode" aria-labelledby={`ep-${e.n}-title`}>
            <header className="episode__head">
              <span className="episode__n">{String(e.n).padStart(2, '0')}</span>
              <h2 id={`ep-${e.n}-title`} className="h2">{e.label}</h2>
            </header>
            <div className="frame">
              <video controls preload="none" playsInline poster={e.poster} data-testid={`video-episode-${e.n}`}>
                <source src={e.src} type="video/mp4" />
                Your browser cannot play this video. <a href={e.src}>Open {e.label}</a>.
              </video>
            </div>
          </article>
        ))}
        <section className="later" aria-label="Later episodes and research context">
          <p className="kicker">Further layers</p>
          <p className="prose muted">Space for later episodes and research context. No additional material is published in this preview.</p>
        </section>
      </div>
    </div>
  );
}
