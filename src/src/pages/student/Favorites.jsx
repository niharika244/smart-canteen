import { Heart } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import FoodCard from '../../components/FoodCard';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';
import EmptyState from '../../components/EmptyState';

export default function Favorites() {
  const { menu, favorites, loading } = useApp();
  const items = menu.filter((i) => favorites.includes(i.id));

  return (
    <div>
      <header className="page-head">
        <h1>Favorites</h1>
        <p>Dishes you've saved for quick ordering.</p>
      </header>
      <div className="section">
        {loading ? <FoodGridSkeleton /> : items.length === 0 ? (
          <EmptyState icon={Heart} title="No favorites yet" text="Tap the heart on any dish to save it here." actionLabel="Browse menu" actionTo="/menu" />
        ) : (
          <div className="food-grid">{items.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        )}
      </div>
    </div>
  );
}
