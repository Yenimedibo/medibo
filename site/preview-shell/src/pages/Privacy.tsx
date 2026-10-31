import { PageHead } from '../components/Shell';
import { LIVE } from '../components/links';

export default function Privacy() {
  return (
    <div className="wrap">
      <PageHead kicker="Footer" title="Privacy & storage" />
      <div className="split rise d2">
        <div>
          <a href={LIVE.privacy} className="cta" data-testid="link-privacy-live">
            Read the live privacy page <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="prose">
          <p>The privacy and storage promises that apply are the ones published on bourkia.com.</p>
          <p className="muted">This website shell does not set application cookies, include analytics or read and write browser records. The preview host may keep operational request logs under its own policies.</p>
        </div>
      </div>
    </div>
  );
}
