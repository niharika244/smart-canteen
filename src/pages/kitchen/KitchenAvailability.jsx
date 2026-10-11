import { Pause, Play } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import Toggle from '../../components/Toggle';
import VegMark from '../../components/VegMark';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function KitchenAvailability() {
  const { menu, categories, kitchen, loading, updateSettings, setItemAvailability } = useApp();
  const unavailableCount = menu.filter((i) => !i.available).length;

  return (
    <div>
      <header className="page-head">
        <h1>Availability</h1>
        <p>{unavailableCount} {unavailableCount === 1 ? 'item is' : 'items are'} unavailable. Students see changes straight away.</p>
      </header>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>{kitchen.paused ? 'New orders are paused' : 'Taking new orders'}</h2>
        <button type="button" className={`btn btn-lg ${kitchen.paused ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateSettings({ paused: !kitchen.paused })}>
          {kitchen.paused ? <><Play size={18} aria-hidden="true" /> Resume orders</> : <><Pause size={18} aria-hidden="true" /> Pause new orders</>}
        </button>
      </section>

      {loading ? <FoodGridSkeleton count={4} /> : categories.map((c) => {
        const items = menu.filter((i) => i.category === c.id);
        if (items.length === 0) return null;
        return (
          <section className="section" key={c.id} aria-labelledby={`cat-${c.id}`}>
            <div className="section-head"><h2 id={`cat-${c.id}`}>{c.name}</h2></div>
            <ul className="avail-list">
              {items.map((i) => (
                <li key={i.id}>
                  <span className="avail-name"><VegMark veg={i.veg} /> {i.name}</span>
                  <span className="avail-state">{i.available ? 'Available' : 'Unavailable'}</span>
                  <Toggle checked={i.available} label={`${i.name} available`} onChange={(v) => setItemAvailability(i.id, v)} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
