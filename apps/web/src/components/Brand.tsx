import { Link } from 'react-router-dom';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand${compact ? ' brand--compact' : ''}`} to="/" aria-label="NexSolarix home">
      <svg className="brand-mark" viewBox="0 0 42 42" role="img" aria-label="">
        <circle className="brand-orbit" cx="21" cy="21" r="15.2" />
        <path className="brand-n" d="M13.2 28.5V13.3l15.6 15.3V13.2" />
        <circle className="brand-sun" cx="33.1" cy="9.5" r="2.25" />
      </svg>
      <span className="brand-name">NEX<span>SOLARIX</span></span>
    </Link>
  );
}
