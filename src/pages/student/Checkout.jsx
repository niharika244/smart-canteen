import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { estimateOrderMinutes, getKitchenStatus } from '../../services/estimateService';
import { getPickupSlots } from '../../utils/pickupSlots';
import { addMinutes, formatTime } from '../../utils/time';
import { formatPrice } from '../../utils/format';
import QtyStepper from '../../components/QtyStepper';
import EmptyState from '../../components/EmptyState';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function Checkout() {
  const { cartLines, cartTotal, kitchen, profile, loading, placeOrder, setQty, updateProfile } = useApp();
  const navigate = useNavigate();

  const [now] = useState(() => Date.now()); // fixed when the page opens so slots don't jump around
  const [name, setName] = useState(profile.name || '');
  const [notes, setNotes] = useState('');
  const [pickup, setPickup] = useState('asap');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const status = useMemo(() => (kitchen ? getKitchenStatus(kitchen) : null), [kitchen]);
  const estMins = useMemo(
    () => (kitchen ? estimateOrderMinutes(cartLines.map((l) => l.item), kitchen) : 0),
    [cartLines, kitchen]
  );
  const slots = useMemo(() => getPickupSlots(now, estMins), [now, estMins]);

  if (loading) return <FoodGridSkeleton count={3} />;
  if (cartLines.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add some food first, then come back to check out." actionLabel="Browse menu" actionTo="/menu" />;
  }

  const paused = Boolean(kitchen?.paused);
  const readyAround = formatTime(addMinutes(new Date(now).toISOString(), estMins));

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Please enter your name (at least 2 characters).';
    if (notes.length > 150) next.notes = 'Notes can be up to 150 characters.';
    if (pickup !== 'asap') {
      const earliest = Date.now() + estMins * 60000;
      if (!slots.includes(pickup) || new Date(pickup).getTime() < earliest - 60000) {
        next.pickup = 'That pickup time is no longer realistic. Please choose a later time, or refresh the page to see updated times.';
      }
    }
    setErrors(next);
    setSubmitError('');
    if (Object.keys(next).length > 0) return;

    const result = placeOrder({ customerName: name.trim(), notes: notes.trim(), pickupAt: pickup === 'asap' ? null : pickup });
    if (!result.ok) { setSubmitError(result.error); return; }
    if (!profile.name) updateProfile({ name: name.trim() });
    navigate(`/orders/${result.order.id}/confirmed`, { replace: true });
  }

  return (
    <div>
      <Link to="/menu" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Back to menu</Link>
      <header className="page-head">
        <h1>Checkout</h1>
        <p>Review your order and choose when to pick it up.</p>
      </header>

      <form className="two-col" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {paused && <div className="alert alert--error" role="alert">The kitchen has paused new orders for now. You can place your order once it reopens.</div>}
          {!paused && status?.level === 'busy' && <div className="alert alert--warn">{status.label}. {status.message}</div>}
          {submitError && <div className="alert alert--error" role="alert">{submitError}</div>}

          <fieldset className="option-list">
            <legend>Pickup time</legend>
            <label className="option">
              <input type="radio" name="pickup" value="asap" checked={pickup === 'asap'} onChange={() => setPickup('asap')} />
              <span><strong>As soon as it's ready</strong><small>About {estMins} min, around {readyAround}</small></span>
            </label>
            {slots.map((slot) => (
              <label className="option" key={slot}>
                <input type="radio" name="pickup" value={slot} checked={pickup === slot} onChange={() => setPickup(slot)} />
                <span><strong>{formatTime(slot)}</strong><small>Pick up at this time</small></span>
              </label>
            ))}
            {errors.pickup && <p className="field-error" role="alert">{errors.pickup}</p>}
            <p className="note">Times are estimates from a simple demo calculation, not a guarantee.</p>
          </fieldset>

          <div className="field">
            <label htmlFor="co-name">Your name</label>
            <input
              id="co-name" className={`input ${errors.name ? 'input--error' : ''}`} value={name} autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'co-name-error' : undefined}
            />
            {errors.name && <p id="co-name-error" className="field-error" role="alert">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="co-notes">Notes for the kitchen <span className="hint">(optional)</span></label>
            <textarea
              id="co-notes" className={`input ${errors.notes ? 'input--error' : ''}`} value={notes} rows={3}
              onChange={(e) => setNotes(e.target.value)}
              aria-invalid={Boolean(errors.notes)} aria-describedby="co-notes-hint"
            />
            <p id="co-notes-hint" className="hint">{notes.length}/150 characters</p>
            {errors.notes && <p className="field-error" role="alert">{errors.notes}</p>}
          </div>
        </div>

        <aside className="panel sticky" aria-label="Order summary">
          <h2>Your order</h2>
          <div>
            {cartLines.map(({ item, qty }) => (
              <div className="cart-line" key={item.id}>
                <div className="cart-line-top"><strong>{item.name}</strong><span>{formatPrice(item.price * qty)}</span></div>
                <div className="cart-line-actions"><QtyStepper qty={qty} name={item.name} onChange={(q) => setQty(item.id, q)} /></div>
              </div>
            ))}
          </div>
          <div className="total-row"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
          <div className="alert alert--ok">Demo checkout: pay at the counter. No online payment is taken.</div>
          <button type="submit" className="btn btn-primary" disabled={paused}>Place order</button>
        </aside>
      </form>
    </div>
  );
}
