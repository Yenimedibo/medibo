import { Link } from 'wouter';
import { PageHead } from '../components/Shell';

export default function NotFound() {
  return (
    <div className="wrap">
      <PageHead kicker="404" title="Not here." sub="This page doesn't exist on the preview. Some questions don't have an answer yet; this one simply has a wrong address.">
        <Link href="/" className="cta" data-testid="link-404-home">Back to the start <span aria-hidden="true">→</span></Link>
      </PageHead>
    </div>
  );
}
