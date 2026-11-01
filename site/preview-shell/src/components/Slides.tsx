import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export type Slide = { key: string; label: string; content: ReactNode };

export function Slides({ slides, label, initial = 0 }: { slides: Slide[]; label: string; initial?: number }) {
  const [index, setIndex] = useState(initial);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const total = slides.length;
  const go = (i: number) => setIndex(Math.max(0, Math.min(total - 1, i)));
  useEffect(() => {
    const revealCourses = () => { if (window.location.hash === '#shop') setIndex(0); };
    revealCourses();
    window.addEventListener('hashchange', revealCourses);
    return () => window.removeEventListener('hashchange', revealCourses);
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest('a, video, input, textarea')) return;
    const next = e.key === 'ArrowRight' ? index + 1 : e.key === 'ArrowLeft' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? total - 1 : null;
    if (next !== null) {
      e.preventDefault();
      go(next);
      if (t.classList.contains('deck__tab')) {
        const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('.deck__tab');
        buttons[Math.max(0, Math.min(total - 1, next))]?.focus();
      }
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') { startX.current = e.clientX; startY.current = e.clientY; }
  };
  const onUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - (startY.current ?? e.clientY);
    startX.current = null;
    startY.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="deck" role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKey} data-testid="slides-work">
      <div className="deck__tabs" role="group" aria-label="Choose a slide">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className="deck__tab"
            aria-current={i === index ? 'true' : undefined}
            aria-controls={`slide-${s.key}`}
            onClick={() => go(i)}
            data-testid={`button-slide-${s.key}`}
          >
            <span className="deck__tabnum">0{i + 1}</span> {s.label}
          </button>
        ))}
      </div>
      <div className="deck__viewport" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { startX.current = null; }}>
        {slides.map((s, i) => (
          <div
            key={s.key}
            id={`slide-${s.key}`}
            className="deck__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}: ${s.label}`}
            hidden={i !== index}
            data-testid={`slide-${s.key}`}
          >
            {s.content}
          </div>
        ))}
      </div>
      <div className="deck__controls">
        <button type="button" className="deck__btn" onClick={() => go(index - 1)} aria-disabled={index === 0} aria-label="Previous slide" data-testid="button-slide-prev">
          <span aria-hidden="true">←</span> Previous
        </button>
        <p className="deck__count" aria-live="polite" data-testid="text-slide-count">
          <span>{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
        </p>
        <button type="button" className="deck__btn" onClick={() => go(index + 1)} aria-disabled={index === total - 1} aria-label="Next slide" data-testid="button-slide-next">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
