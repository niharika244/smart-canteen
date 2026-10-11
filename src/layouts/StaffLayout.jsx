import { Link, NavLink, Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';

// Shared shell for the kitchen and admin areas.
// DEMO ONLY: there is no staff login here. A real deployment must require sign-in and check roles on the server.
export default function StaffLayout({ title, home, links }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="staff-header">
        <div className="container header-inner">
          <Link to={home} className="brand">
            <Leaf size={22} aria-hidden="true" />
            <span>Smart Canteen</span>
            <span className="staff-badge">{title}</span>
          </Link>
          <nav className="staff-nav" aria-label={`${title} navigation`}>
            {links.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink key={to} to={to} end={end}>
                <Icon size={18} aria-hidden="true" />
                {label}
                {badge > 0 && <span className="cart-badge">{badge}</span>}
              </NavLink>
            ))}
            <Link to="/">Student view</Link>
          </nav>
        </div>
        <div className="staff-banner">
          <div className="container">Demo mode: no staff sign-in in this prototype. Data is stored in this browser only.</div>
        </div>
      </header>
      <main id="main" className="container page"><Outlet /></main>
    </>
  );
}
