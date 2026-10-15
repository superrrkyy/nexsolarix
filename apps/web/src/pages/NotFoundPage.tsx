import { ArrowLeft, ArrowUpRight, Orbit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="page-shell missing-page">
      <div className="missing-icon"><Orbit size={26} /></div>
      <span className="section-kicker"><span>404</span> OUTSIDE THE MAP</span>
      <h1>This coordinate<br /><em>isn't mapped.</em></h1>
      <p>The route you requested is not part of the current NexSolarix atlas. Continue from a known point in the sky.</p>
      <div className="missing-actions"><Link className="button button-primary" to="/explore">Return to the atlas <ArrowUpRight size={15} /></Link><button className="button button-secondary" type="button" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Go back</button></div>
    </main>
  );
}
