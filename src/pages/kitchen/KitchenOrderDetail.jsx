import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useNow } from '../../hooks/useNow';
import { ORDER_STATUS } from '../../utils/orderStatus';
import { isDelayed } from '../../utils/kitchenQueue';
import { formatDateTime, formatTime, orderTimeText } from '../../utils/time';
import { formatPrice } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import OrderActions from '../../components/kitchen/OrderActions';
import EmptyState from '../../components/EmptyState';

export default function KitchenOrderDetail() {
  const { id } = useParams();
  const { orders } = useApp();
  const now = useNow(30000);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return <EmptyState icon={SearchX} title="Order not found" text="It may have been cleared from this browser." actionLabel="Back to orders" actionTo="/kitchen" />;
  }

  const { label, time } = orderTimeText(order);
  const delayed = isDelayed(order, now);

  return (
    <div>
      <Link to="/kitchen" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> All orders</Link>
      <header className="page-head">
        <h1>Order {order.number}</h1>
        <p>{order.customerName} · placed {formatDateTime(order.createdAt)}</p>
      </header>

      <div className="two-col">
        <div className="form-grid">
          <section className="panel">
            <div className="k-badges">
              <StatusBadge status={order.status} />
              {delayed && <span className="status-badge status-badge--rejected">Delayed</span>}
            </div>
            <p><strong>{label}: {time}</strong></p>
            {order.estimateAdjustedMins > 0 && <p className="note">Estimate extended by {order.estimateAdjustedMins} min.</p>}
            {order.rejectReason && <p className="alert alert--error">Rejected: {order.rejectReason}</p>}
            {order.notes && <p className="k-note">Note: {order.notes}</p>}
            <OrderActions order={order} />
          </section>

          <section className="panel">
            <h2>Timeline</h2>
            <ol className="timeline">
              {order.statusHistory.map((h, i) => (
                <li key={`${h.status}-${i}`}><strong>{ORDER_STATUS[h.status]?.label ?? h.status}</strong> at {formatTime(h.at)}</li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="panel" aria-label="Items">
          <h2>Items</h2>
          <ul className="k-items">
            {order.items.map((i) => <li key={i.itemId}>{i.qty} × {i.name}</li>)}
          </ul>
          <div className="total-row"><span>Total (pay at counter)</span><span>{formatPrice(order.total)}</span></div>
        </aside>
      </div>
    </div>
  );
}
