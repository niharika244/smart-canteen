import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useNow } from '../../hooks/useNow';
import { useReorder } from '../../hooks/useReorder';
import { ORDER_STATUS, QUEUE_STATUSES, canCancel, isActive, nextStatus } from '../../utils/orderStatus';
import { formatDateTime, minutesUntil, orderTargetTime, orderTimeText } from '../../utils/time';
import { formatPrice } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import OrderProgress from '../../components/OrderProgress';
import EmptyState from '../../components/EmptyState';

export default function OrderTracking() {
  const { id } = useParams();
  const { orders, settings, updateOrderStatus, cancelOrder } = useApp();
  const now = useNow(30000);
  const { notice, handleReorder } = useReorder();
  const [cancelled, setCancelled] = useState(false);

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return <EmptyState icon={SearchX} title="Order not found" text="This order isn't saved in this browser." actionLabel="View my orders" actionTo="/orders" />;
  }

  const info = ORDER_STATUS[order.status];
  const active = isActive(order);
  const inQueue = QUEUE_STATUSES.includes(order.status);
  const next = nextStatus(order.status);
  const cancellable = canCancel(order, settings.cancellableStatuses);
  const { label, time } = orderTimeText(order);
  const target = orderTargetTime(order);
  const minsLeft = minutesUntil(target, now);
  const late = inQueue && new Date(order.estimatedReadyAt).getTime() < now;
  // Only counts orders placed in this browser's demo, so it's labelled as demo data below.
  const ahead = orders.filter((o) => o.id !== order.id && QUEUE_STATUSES.includes(o.status) && o.createdAt < order.createdAt).length;

  function handleCancel() {
    if (window.confirm('Cancel this order? This cannot be undone.')) setCancelled(cancelOrder(order.id));
  }

  return (
    <div>
      <Link to="/orders" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> My orders</Link>
      <header className="page-head">
        <h1>Order {order.number}</h1>
        <p>Placed {formatDateTime(order.createdAt)} for {order.customerName}</p>
      </header>

      <div className="two-col">
        <div className="form-grid">
          <section className="panel" aria-live="polite">
            <StatusBadge status={order.status} />
            <p>{info.explain}</p>
            {order.status === 'rejected' && order.rejectReason && <p className="alert alert--error">Reason: {order.rejectReason}</p>}
            {STATUS_SHOW_PROGRESS(order.status) && <OrderProgress status={order.status} />}
          </section>

          {active && order.status !== 'ready' && (
            <section className="panel panel--tint">
              <div className="estimate">
                <span className="note">{label}</span>
                <strong>{time}</strong>
                {minsLeft > 0 && !late && <span>about {minsLeft} min from now</span>}
              </div>
              {late && <p className="warn">This is taking longer than the original estimate. Please check at the counter if it keeps running late.</p>}
              {order.estimateAdjustedMins > 0 && <p className="note">The kitchen added {order.estimateAdjustedMins} min to your estimate.</p>}
              {inQueue && <p className="note">Orders ahead of yours (demo data from this browser): {ahead}</p>}
            </section>
          )}

          {notice && <div className="alert alert--warn" role="status">{notice}</div>}
          {cancelled && <div className="alert alert--ok" role="status">Your order was cancelled.</div>}

          <div className="btn-row btn-row--left">
            {cancellable && <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel order</button>}
            <button type="button" className="btn btn-secondary" onClick={() => handleReorder(order.id)}>Reorder</button>
          </div>
          {active && !cancellable && <p className="note">This order can no longer be cancelled here. Please speak to the canteen staff.</p>}

          {active && next && (
            <div className="demo-box">
              <strong>Demo control: simulate the kitchen</strong>
              <p className="note">In the real product, kitchen staff change this status. Use this button to step through the flow while testing.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateOrderStatus(order.id, next)}>
                Mark as “{ORDER_STATUS[next].label}”
              </button>
            </div>
          )}
        </div>

        <aside className="panel" aria-label="Order details">
          <h2>Items</h2>
          <ul className="items-list">
            {order.items.map((i) => (
              <li key={i.itemId}><span>{i.qty} × {i.name}</span><span>{formatPrice(i.price * i.qty)}</span></li>
            ))}
          </ul>
          <div className="total-row"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          {order.notes && <p className="note">Your note: {order.notes}</p>}
          <p className="note">Pay at the counter (demo, no online payment).</p>
        </aside>
      </div>
    </div>
  );
}

// Cancelled and rejected orders don't follow the normal progress steps.
function STATUS_SHOW_PROGRESS(status) {
  return status !== 'cancelled' && status !== 'rejected';
}
