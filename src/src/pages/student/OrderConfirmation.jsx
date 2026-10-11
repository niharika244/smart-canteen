import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { orderTimeText } from '../../utils/time';
import { formatPrice } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return <EmptyState icon={SearchX} title="Order not found" text="This order isn't saved in this browser." actionLabel="View my orders" actionTo="/orders" />;
  }

  const { label, time } = orderTimeText(order);

  return (
    <section className="confirm" aria-labelledby="confirm-title">
      <CheckCircle2 size={48} className="confirm-icon" aria-hidden="true" />
      <h1 id="confirm-title">Order placed</h1>
      <p>Your order number is</p>
      <p className="order-number">{order.number}</p>
      <StatusBadge status={order.status} />
      <div className="estimate">
        <span className="note">{label}</span>
        <strong>{time}</strong>
      </div>
      <ul className="items-list" style={{ width: '100%' }}>
        {order.items.map((i) => (
          <li key={i.itemId}><span>{i.qty} × {i.name}</span><span>{formatPrice(i.price * i.qty)}</span></li>
        ))}
        <li><strong>Total (pay at counter)</strong><strong>{formatPrice(order.total)}</strong></li>
      </ul>
      <div className="btn-row">
        <Link to={`/orders/${order.id}`} className="btn btn-primary">Track order</Link>
        <Link to="/menu" className="btn btn-secondary">Back to menu</Link>
      </div>
      <p className="note">Demo: this order is saved only in this browser and is not sent to a real kitchen.</p>
    </section>
  );
}
