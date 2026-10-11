import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../utils/format';
import { formatDateTime } from '../utils/time';
import { isActive } from '../utils/orderStatus';

export default function OrderCard({ order, onReorder }) {
  const summary = order.items.map((i) => `${i.qty} × ${i.name}`).join(', ');
  return (
    <article className="order-card">
      <div className="order-card-top">
        <strong>{order.number}</strong>
        <StatusBadge status={order.status} />
      </div>
      <p className="note">{formatDateTime(order.createdAt)}</p>
      <p>{summary}</p>
      <div className="summary-line"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
      <div className="order-card-actions">
        <Link to={`/orders/${order.id}`} className="btn btn-primary btn-sm">{isActive(order) ? 'Track order' : 'View details'}</Link>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReorder(order.id)}>Reorder</button>
      </div>
    </article>
  );
}
