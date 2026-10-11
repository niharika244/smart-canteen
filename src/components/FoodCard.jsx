import { Link } from 'react-router-dom';
import { Clock, Heart, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatPrice } from '../utils/format';
import FoodImage from './FoodImage';
import VegMark from './VegMark';
import QtyStepper from './QtyStepper';

export default function FoodCard({ item }) {
  const { cart, addToCart, setQty, favorites, toggleFavorite } = useApp();
  const inCart = cart.find((c) => c.itemId === item.id);
  const isFav = favorites.includes(item.id);

  return (
    <article className={`food-card ${item.available ? '' : 'is-unavailable'}`}>
      <div className="food-media">
        <FoodImage src={item.image} />
        <button
          type="button"
          className={`fav-btn ${isFav ? 'is-on' : ''}`}
          onClick={() => toggleFavorite(item.id)}
          aria-pressed={isFav}
          aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="food-card-body">
        <div className="food-title"><VegMark veg={item.veg} /><h3><Link to={`/menu/${item.id}`}>{item.name}</Link></h3></div>
        <p className="food-desc">{item.description}</p>
        <div className="food-meta">
          <span className="meta"><Clock size={14} aria-hidden="true" /> ~{item.prepMins} min</span>
          <span className={`badge ${item.available ? 'badge--ok' : 'badge--off'}`}>
            {item.available ? 'Available' : 'Unavailable today'}
          </span>
          {item.dailyLimit && <span className="badge badge--off">Limited quantity</span>}
          {item.allergens.length > 0 && <span className="meta">Contains: {item.allergens.join(', ')}</span>}
        </div>
        <div className="food-footer">
          <strong className="price">{formatPrice(item.price)}</strong>
          {!item.available ? (
            <button type="button" className="btn btn-secondary btn-sm" disabled>Unavailable</button>
          ) : inCart ? (
            <QtyStepper qty={inCart.qty} name={item.name} onChange={(q) => setQty(item.id, q)} />
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(item.id)}>
              <Plus size={16} aria-hidden="true" /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
