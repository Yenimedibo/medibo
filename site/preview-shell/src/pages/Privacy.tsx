import { LiveDestination } from '../components/LiveDestination';
import { LIVE } from '../components/links';

export default function Privacy() {
  return <LiveDestination url={LIVE.privacy} label="Privacy & storage" />;
}
