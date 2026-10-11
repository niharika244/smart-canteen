import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Pause, Play, Search } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useNow } from '../../hooks/useNow';
import { getKitchenStatus } from '../../services/estimateService';
import { QUEUE_STATUSES, isActive } from '../../utils/orderStatus';
import { isDelayed, matchesSearch, sortByPriority } from '../../utils/kitchenQueue';
import KitchenOrderCard from '../../components/kitchen/KitchenOrderCard';
import EmptyState from '../../components/EmptyState';

const FILTERS = [
  { id: 'active', label: 'All active', test: (o) => isActive(o) },
  { id: 'placed', label: 'New', test: (o) => o.status === 'placed' },
  { id: 'accepted', label: 'Accepted', test: (o) => o.status === 'accepted' },
  { id: 'preparing', label: 'Preparing', test: (o) => o.status === 'preparing' },
  { id: 'ready', label: 'Ready', test: (o) => o.status === 'ready' },
  { id: 'done', label: 'Completed', test: (o) => !isActive(o) },
];

export default function KitchenDashboard() {
  const { orders, menu, kitchen, updateSettings } = useApp();
  const now = useNow(30000);
  const [filterId, setFilterId] = useState('active');
  const [query, setQuery] = useState('');

  const status = getKitchenStatus(kitchen);
  const filter = FILTERS.find((f) => f.id === filterId);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, orders.filter(f.test).length])), [orders]);
  const delayedCount = orders.filter((o) => isDelayed(o, now)).length;
  const queueCount = orders.filter((o) => QUEUE_STATUSES.includes(o.status)).length;
  const unavailable = menu.filter((i) => !i.available);

  const list = useMemo(() => {
    const base = orders.filter((o) => filter.test(o) && matchesSearch(o, query));
    return filterId === 'done' ? base : sortByPriority(base, now);
  }, [orders, filter, filterId, query, now]);

  return (
    <div>
      <header className="page-head">
        <h1>Kitchen orders</h1>
        <p>Delayed orders appear first, then new orders.</p>
      </header>

      <div className="kitchen-bar">
        <section className={`status-card status-card--${status.level}`} aria-label="Kitchen load">
          <h2>{status.label}</h2>
          <p>{status.message}</p>
          <p className="note">Orders waiting: {queueCount} (plus a demo baseline of walk-up orders). Delayed: {delayedCount}.</p>
        </section>

        <section className="panel" aria-label="New orders">
          <h2>{kitchen.paused ? 'New orders are paused' : 'Taking new orders'}</h2>
          <p className="note">Pausing blocks students from placing new orders. Existing orders are not affected.</p>
          <button type="button" className={`btn btn-lg ${kitchen.paused ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateSettings({ paused: !kitchen.paused })}>
            {kitchen.paused ? <><Play size={18} aria-hidden="true" /> Resume orders</> : <><Pause size={18} aria-hidden="true" /> Pause new orders</>}
          </button>
        </section>
      </div>

      {unavailable.length > 0 && (
        <p className="note" style={{ marginTop: 12 }}>
          Unavailable now: {unavailable.map((i) => i.name).join(', ')}. <Link to="/kitchen/availability" className="link">Change availability</Link>
        </p>
      )}

      <div className="section">
        <div className="field" style={{ maxWidth: 360 }}>
          <label htmlFor="k-search">Search by order number or name</label>
          <div className="input-icon">
            <Search size={18} aria-hidden="true" />
            <input id="k-search" type="search" className="input" placeholder="e.g. 1004" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="chip-row" role="group" aria-label="Filter orders" style={{ marginTop: 12 }}>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={filterId === f.id} onClick={() => setFilterId(f.id)}>
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>

        <p className="result-count" aria-live="polite">{list.length} {list.length === 1 ? 'order' : 'orders'}</p>
        {list.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={orders.length === 0 ? 'No orders yet' : 'No orders match'}
            text={orders.length === 0 ? 'Orders placed from the student view show up here.' : 'Try another filter or clear the search.'}
            actionLabel="Open student view" actionTo="/menu"
          />
        ) : (
          <div className="kitchen-grid">{list.map((o) => <KitchenOrderCard key={o.id} order={o} now={now} />)}</div>
        )}
      </div>
    </div>
  );
}
