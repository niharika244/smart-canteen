import { Link, NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Home, Leaf, ShoppingBag, User, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import CartDrawer from '../components/CartDrawer';

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function StudentLayout() {
  const { college, cartCount, openCart } = useApp();

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <Leaf size={24} aria-hidden="true" />
            <span>
              Smart Canteen
              <span className="brand-sub">{college ? `${college.name} · ${college.canteen}` : 'Loading…'}</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Main">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/menu" className={navClass}>Menu</NavLink>
            <NavLink to="/orders" className={navClass}>Orders</NavLink>
            <NavLink to="/favorites" className={navClass}>Favorites</NavLink>
            <NavLink to="/profile" className={navClass}>Profile</NavLink>
          </nav>
          <button type="button" className="btn btn-secondary cart-btn--header" onClick={openCart} aria-label={`Open cart, ${cartCount} items`}>
            <ShoppingBag size={18} aria-hidden="true" /> Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main id="main" className="container page"><Outlet /></main>

      <nav className="bottom-nav" aria-label="Mobile">
        <NavLink to="/" end className={navClass}><Home size={22} aria-hidden="true" />Home</NavLink>
        <NavLink to="/menu" className={navClass}><UtensilsCrossed size={22} aria-hidden="true" />Menu</NavLink>
        <NavLink to="/orders" className={navClass}><ClipboardList size={22} aria-hidden="true" />Orders</NavLink>
        <button type="button" onClick={openCart} aria-label={`Open cart, ${cartCount} items`}>
          <ShoppingBag size={22} aria-hidden="true" />Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <NavLink to="/profile" className={navClass}><User size={22} aria-hidden="true" />Profile</NavLink>
      </nav>

      <CartDrawer />
    </>
  );
}
