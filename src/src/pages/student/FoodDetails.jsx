import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, Plus, SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { formatPrice } from '../../utils/format';
import FoodImage from '../../components/FoodImage';
import VegMark from '../../components/VegMark';
import QtyStepper from '../../components/QtyStepper';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';
import EmptyState from '../../components/EmptyState';

export default function FoodDetails() {
  const { id } = useParams();
  const { menu, categories, loading, cart, addToCart, setQty, favorites, toggleFavorite } = useApp();
  const item = menu.find((m) => m.id === id);

  if (loading) return <FoodGridSkeleton count={1} />;
  if (!item) {
    return <EmptyState icon={SearchX} title="We couldn't find that dish" text="It may have been removed from the menu." actionLabel="Back to menu" actionTo="/menu" />;
  }

  const inCart = cart.find((c) => c.itemId === item.id);
  const isFav = favorites.includes(item.id);
  const category = categories.find((c) => c.id === item.category);

  return (
    <div>
      <Link to="/menu" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Back to menu</Link>
      <div className="detail">
        <div className="detail-media"><FoodImage src={item.image} /></div>
        <div className="detail-info">
          <div className="food-title"><VegMark veg={item.veg} /><span className="note">{item.veg ? 'Vegetarian' : 'Non-vegetarian'}</span></div>
          <h1>{item.name}</h1>
          <p className="detail-price">{formatPrice(item.price)}</p>
          <p>{item.description}</p>

          <dl className="facts">
            <div><dt>Category</dt><dd>{category ? category.name : '—'}</dd></div>
            <div><dt>Preparation</dt><dd><Clock size={14} aria-hidden="true" /> about {item.prepMins} min</dd></div>
            <div><dt>Availability</dt><dd>{item.available ? 'Available today' : 'Unavailable today'}</dd></div>
            <div><dt>Allergens</dt><dd>{item.allergens.length ? item.allergens.join(', ') : 'None listed'}</dd></div>
          </dl>
          <p className="note">Allergen details are sample data. Please confirm with canteen staff if you have an allergy.</p>

          <div className="btn-row btn-row--left">
            {!item.available ? (
              <button type="button" className="btn btn-secondary" disabled>Unavailable today</button>
            ) : inCart ? (
              <QtyStepper qty={inCart.qty} name={item.name} onChange={(q) => setQty(item.id, q)} />
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => addToCart(item.id)}>
                <Plus size={18} aria-hidden="true" /> Add to cart
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => toggleFavorite(item.id)} aria-pressed={isFav}>
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" /> {isFav ? 'Saved' : 'Save to favorites'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
