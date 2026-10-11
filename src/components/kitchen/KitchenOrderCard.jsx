import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
import OrderActions from './OrderActions';
import { isActive } from '../../utils/orderStatus';
import { isDelayed } from '../../utils/kitchenQueue';
import { orderTimeText } from '../../utils/time';

export default function KitchenOrderCard({ order, now }) {
  const delayed = isDelayed(order, now);
  const active = isActive(order);
  const waiting = Math.max(0, Math.floor((now - new Date(order.createdAt).getTime()) / 60000));
  const { label, time } = orderTimeText(order);

  return (
    <article className={`k-card k-card--${order.status} ${delayed ? 'k-card--delayed' : ''}`}>
      <div className="k-top">
        <div>
          <p className="k-number">{order.number}</p>
          <p className="note">{order.customerName}</p>
        </div>
        <div className="k-badges">
          <StatusBadge status={order.status} />
          {delayed && <span className="status-badge status-badge--rejected">Delayed</span>}
        </div>
      </div>

      {active && <p><strong>Waiting {waiting} min</strong> · {label} {time}</p>}

      <ul className="k-items">
        {order.items.map((i) => <li key={i.itemId}>{i.qty} × {i.name}</li>)}
      </ul>

      {order.notes && <p className="k-note">Note: {order.notes}</p>}
      {order.rejectReason && <p className="note">Rejected: {order.rejectReason}</p>}

      <OrderActions order={order} />
      <Link to={`/kitchen/orders/${order.id}`} className="link">View details</Link>
    </article>
  );
}
