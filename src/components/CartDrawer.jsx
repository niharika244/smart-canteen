import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatPrice } from '../utils/format';
import QtyStepper from './QtyStepper';

export default function CartDrawer() {
  const { cartOpen, closeCart, cartLines, cartTotal, setQty, removeFromCart, clearCart } = useApp();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!cartOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const hasUnavailable = cartLines.some((l) => !l.item.available);

  function handleClear() {
    // Simple confirm for now. We'll swap in a styled dialog during the polish phase.
    if (window.confirm('Remove all items from your cart?')) clearCart();
  }

  return (
    <>
      <div className="overlay" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
        </div>

        <div className="drawer-body">
          {cartLines.length === 0 ? (
            <div className="empty">
              <ShoppingBag size={32} aria-hidden="true" />
              <h3>Your cart is empty</h3>
              <p>Add something from the menu and it will show up here.</p>
              <Link to="/menu" className="btn btn-primary" onClick={closeCart}>Browse menu</Link>
            </div>
          ) : (
            cartLines.map(({ item, qty }) => (
              <div className="cart-line" key={item.id}>
                <div className="cart-line-top">
                  <strong>{item.name}</strong>
                  <span>{formatPrice(item.price * qty)}</span>
                </div>
                {!item.available && <p className="warn">This item is no longer available. Please remove it.</p>}
                <div className="cart-line-actions">
                  <QtyStepper qty={qty} name={item.name} onChange={(q) => setQty(item.id, q)} />
                  <button type="button" className="icon-btn" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartLines.length > 0 && (
          <div className="drawer-foot">
            <div className="total-row"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
            <p className="note">Demo checkout: no real payment is taken.</p>
            {hasUnavailable && <p className="warn">Remove unavailable items to continue.</p>}
            {hasUnavailable ? (
              <button type="button" className="btn btn-primary" disabled>Go to checkout</button>
            ) : (
              <Link to="/checkout" className="btn btn-primary" onClick={closeCart}>Go to checkout</Link>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear cart</button>
          </div>
        )}
      </aside>
    </>
  );
}
