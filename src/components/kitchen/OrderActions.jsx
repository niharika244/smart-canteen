import { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import Modal from '../Modal';

const REASONS = ['Item out of stock', 'Kitchen is too busy', 'Canteen closing soon', 'Other'];
// The one button the kitchen needs next for each status.
const NEXT_STEP = {
  placed: { label: 'Accept', to: 'accepted' },
  accepted: { label: 'Start preparing', to: 'preparing' },
  preparing: { label: 'Mark ready', to: 'ready' },
  ready: { label: 'Mark collected', to: 'collected' },
};

export default function OrderActions({ order }) {
  const { updateOrderStatus, adjustOrderEstimate } = useApp();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [other, setOther] = useState('');
  const [error, setError] = useState('');

  const step = NEXT_STEP[order.status];
  if (!step) return null;

  function confirmReject() {
    const text = reason === 'Other' ? other.trim() : reason;
    if (!text) { setError('Please type a reason so the student knows why.'); return; }
    updateOrderStatus(order.id, 'rejected', { rejectReason: text });
    setRejecting(false);
  }

  return (
    <>
      <div className="kitchen-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={() => updateOrderStatus(order.id, step.to)}>{step.label}</button>
        {order.status === 'placed' && (
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => setRejecting(true)}>Reject</button>
        )}
        {order.status !== 'ready' && (
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => adjustOrderEstimate(order.id, 5)}>+5 min</button>
        )}
      </div>

      {rejecting && (
        <Modal title={`Reject ${order.number}?`} onClose={() => setRejecting(false)}>
          <p>The student will see the reason.</p>
          <div className="field">
            <label htmlFor={`reason-${order.id}`}>Reason</label>
            <select id={`reason-${order.id}`} className="input" value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }}>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          {reason === 'Other' && (
            <div className="field">
              <label htmlFor={`other-${order.id}`}>Type the reason</label>
              <input id={`other-${order.id}`} className="input" value={other} maxLength={100} onChange={(e) => { setOther(e.target.value); setError(''); }} />
            </div>
          )}
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="btn-row btn-row--left">
            <button type="button" className="btn btn-danger" onClick={confirmReject}>Reject order</button>
            <button type="button" className="btn btn-secondary" onClick={() => setRejecting(false)}>Keep order</button>
          </div>
        </Modal>
      )}
    </>
  );
}
