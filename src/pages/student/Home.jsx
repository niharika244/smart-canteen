import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { getKitchenStatus } from '../../services/estimateService';
import FoodCard from '../../components/FoodCard';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function Home() {
  const { menu, categories, college, kitchen, favorites, welcomed, loading, error, reload } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const status = useMemo(() => (kitchen ? getKitchenStatus(kitchen) : null), [kitchen]);
  const popular = menu.filter((i) => i.popular).slice(0, 4);
  const favoriteItems = menu.filter((i) => favorites.includes(i.id));
  const availableCount = menu.filter((i) => i.available).length;

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/menu?q=${encodeURIComponent(q)}` : '/menu');
  }

  // First visit: let the student pick a college and canteen.
  if (!welcomed) return <Navigate to="/welcome" replace />;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">{college ? `${college.name} · ${college.canteen}` : 'Smart Canteen'}</p>
          <h1 id="hero-title">What are you having today?</h1>
          <p>Order ahead, see roughly when it will be ready, and pick it up at the counter.</p>
          <form className="hero-search" role="search" onSubmit={handleSearch}>
            <Search size={20} aria-hidden="true" />
            <label htmlFor="home-search" className="sr-only">Search food</label>
            <input id="home-search" type="search" placeholder="Search dosa, samosa, coffee…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        </div>

        {status && (
          <aside className={`status-card status-card--${status.level}`} aria-label="Kitchen status">
            <h2>{status.label}</h2>
            <p>{status.message}</p>
            <p className="note">Demo data. Not a live kitchen feed.</p>
          </aside>
        )}
      </section>

      <section className="section" aria-labelledby="cat-title">
        <div className="section-head">
          <h2 id="cat-title">Categories</h2>
          <Link to="/menu?available=1" className="link">{availableCount > 0 ? `${availableCount} dishes available` : 'See menu'}</Link>
        </div>
        <div className="chip-row">
          {categories.map((c) => (
            <Link key={c.id} to={`/menu?category=${c.id}`} className="chip">{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="pop-title">
        <div className="section-head">
          <h2 id="pop-title">Popular on campus</h2>
          <Link to="/menu" className="link">Full menu</Link>
        </div>
        {loading && <FoodGridSkeleton />}
        {error && (
          <div className="empty">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={reload}>Try again</button>
          </div>
        )}
        {!loading && !error && (
          <div className="food-grid">{popular.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        )}
      </section>

      <section className="section" aria-labelledby="fav-title">
        <div className="section-head">
          <h2 id="fav-title">Your favorites</h2>
          <Link to="/favorites" className="link">See all</Link>
        </div>
        {favoriteItems.length > 0 ? (
          <div className="food-grid">{favoriteItems.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        ) : (
          <p className="note">Tap the heart on any dish to save it here.</p>
        )}
      </section>
    </>
  );
}
