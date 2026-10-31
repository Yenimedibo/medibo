import { PageHead } from '../components/Shell';
import { LIVE } from '../components/links';

export default function Workbench() {
  return (
    <div className="wrap">
      <PageHead kicker="Build" title="Workbench" sub="A private place to think in writing. Your entries live in your own browser, on the live site." />
      <div className="split rise d2">
        <div>
          <a href={LIVE.workbench} className="cta" data-testid="link-workbench-live">
            Open Workbench on bourkia.com <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="prose notice">
          <p><strong>Why this opens elsewhere.</strong> Browser storage belongs to a single website address. Your Workbench entries are saved on bourkia.com and stay there.</p>
          <p>This preview does not read, copy or migrate them, and it stores nothing of its own. There is no account, no sync and no upload.</p>
        </div>
      </div>
    </div>
  );
}
