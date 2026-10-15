import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { SearchBox } from './SearchBox';

const links = [
  { label: 'Explore', to: '/explore' },
  { label: 'Solar system', to: '/solar-system' },
  { label: 'Planets', to: '/planets' },
  { label: 'Missions', to: '/missions' }
];

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className={`top-nav${location.pathname === '/explore' || location.pathname === '/solar-system' ? ' top-nav--overlay' : ''}`}>
      <div className="top-nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/discover" className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}>Discover</NavLink>
        </nav>
        <div className="top-nav-actions">
          <SearchBox className="desktop-search" />
          <NavLink className="nav-cta" to="/explore"><span>Open atlas</span><span aria-hidden="true">↗</span></NavLink>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-menu">
          <SearchBox className="mobile-search" />
          <nav aria-label="Mobile navigation">
            {links.concat([{ label: 'Moons', to: '/moons' }, { label: 'Discover', to: '/discover' }, { label: 'Sources', to: '/sources' }]).map((link, index) => (
              <NavLink key={`${link.to}-${index}`} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'mobile-nav-link is-active' : 'mobile-nav-link'}>
                {link.label}<span aria-hidden="true">↗</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
