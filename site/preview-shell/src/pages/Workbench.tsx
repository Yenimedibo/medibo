import { LiveDestination } from '../components/LiveDestination';
import { LIVE } from '../components/links';

export default function Workbench() {
  return <LiveDestination url={LIVE.workbench} label="Workbench" />;
}
