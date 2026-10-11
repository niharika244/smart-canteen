import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

// Decorative image (the dish name is always shown beside it). Falls back if the file is missing.
export default function FoodImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="food-img food-img--fallback" aria-hidden="true"><UtensilsCrossed size={28} /></div>;
  }
  return <img className="food-img" src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
