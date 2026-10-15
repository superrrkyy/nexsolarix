import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from './Brand';

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer--interior">
      <div className="footer-main"><div><Brand /><span className="footer-microcopy">SCIENTIFIC EXPLORATION, OPEN TO EVERYONE.</span></div><div className="footer-links"><Link to="/about">About</Link><Link to="/sources">Sources</Link><Link to="/missions">Missions</Link><Link to="/events">Events</Link></div><span className="footer-coordinate">INDEPENDENT · EDUCATIONAL · NOT A NASA PRODUCT</span></div>
      <div className="footer-bottom"><span>© 2026 NexSolarix. An independent exploration platform.</span><Link to="/sources">Data methodology <ArrowUpRight size={12} /></Link></div>
    </footer>
  );
}
