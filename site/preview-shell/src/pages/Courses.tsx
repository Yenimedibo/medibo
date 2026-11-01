import { PageHead } from '../components/Shell';
import { LIVE } from '../components/links';

type Course = {
  id: string; title: string; subtitle: string; href: string;
  facts: { label: string; value: string }[];
  downloads: { href: string; label: string; lang: string; dir?: 'rtl' }[];
};

const COURSES: Course[] = [
  {
    id: 'talk-to-ai', title: 'TALK TO AI', subtitle: 'From Introduction to Mastery', href: LIVE.talkToAi,
    facts: [
      { label: 'Foundation lessons', value: '24' },
      { label: 'Applied workshops', value: '6' },
      { label: 'Languages', value: 'English + Darija' },
    ],
    downloads: [
      { href: 'https://bourkia.com/courses/talk-to-ai/downloads/course-en.pdf', label: 'English PDF', lang: 'en' },
      { href: 'https://bourkia.com/courses/talk-to-ai/downloads/course-dar.pdf', label: 'الدارجة PDF', lang: 'ar-MA', dir: 'rtl' },
    ],
  },
];

export default function Courses() {
  return (
    <div className="wrap">
      <PageHead kicker="Learn" title="Courses" sub="Free to read and download. No payment, no enrollment." />
      <ul className="courses rise d2">
        {COURSES.map((c, i) => (
          <li key={c.id} className="course">
            <span className="course__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="course__body">
              <h2 className="course__title">{c.title}</h2>
              <p className="course__sub">{c.subtitle}</p>
              <dl className="facts">
                {c.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
              </dl>
              <div className="course__actions">
                <a href={c.href} className="cta" data-testid={`link-course-${c.id}`}>
                  Open the course <span aria-hidden="true">→</span>
                </a>
                {c.downloads.map((d) => (
                  <a key={d.href} href={d.href} className="dl" lang={d.lang} dir={d.dir} data-testid={`link-download-${c.id}-${d.lang}`}>
                    {d.label}
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
