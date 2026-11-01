import { PageHead } from '../components/Shell';
import { LIVE } from '../components/links';

const COURSES = [
  { id: 'talk-to-ai', title: 'TALK TO AI', subtitle: 'From Introduction to Mastery', href: LIVE.talkToAi },
];

export default function Courses() {
  return (
    <div className="wrap">
      <PageHead kicker="Learn" title="Courses" sub="Structured paths for learning something properly, from the first question to confident practice." />
      <ul className="courses rise d2">
        {COURSES.map((c, i) => (
          <li key={c.id} className="course">
            <span className="course__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="course__body">
              <h2 className="course__title">{c.title}</h2>
              <p className="course__sub">{c.subtitle}</p>
              <p>Free · English + Darija · Downloadable</p>
              <a href={c.href} className="cta" data-testid={`link-course-${c.id}`}>
                Open the course <span aria-hidden="true">→</span>
              </a>
              <p className="fine">Opens the existing course on bourkia.com. Lessons, languages and downloads are unchanged.</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
