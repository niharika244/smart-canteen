import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useReorder } from '../../hooks/useReorder';
import { isActive } from '../../utils/orderStatus';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';

export default function Orders() {
  const { orders } = useApp();
  const { notice, handleReorder } = useReorder();
  const [tab, setTab] = useState('current');

  const current = orders.filter(isActive);
  const past = orders.filter((o) => !isActive(o));
  const list = tab === 'current' ? current : past;

  return (
    <div>
      <header className="page-head">
        <h1>My orders</h1>
        <p>Orders placed in this browser (demo).</p>
      </header>

      <div className="tabs" role="group" aria-label="Order filter">
        <button type="button" className="chip" aria-pressed={tab === 'current'} onClick={() => setTab('current')}>Current ({current.length})</button>
        <button type="button" className="chip" aria-pressed={tab === 'past'} onClick={() => setTab('past')}>Past ({past.length})</button>
      </div>

      {notice && <div className="alert alert--warn" role="status" style={{ marginBottom: 16 }}>{notice}</div>}

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={tab === 'current' ? 'No current orders' : 'No past orders yet'}
          text={tab === 'current' ? 'When you place an order, you can track it here.' : 'Finished and cancelled orders will show up here, ready to reorder.'}
          actionLabel="Browse menu" actionTo="/menu"
        />
      ) : (
        <div className="order-list">{list.map((o) => <OrderCard key={o.id} order={o} onReorder={handleReorder} />)}</div>
      )}
    </div>
  );
}
