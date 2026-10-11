import { Check } from 'lucide-react';
import { ORDER_STATUS, STATUS_FLOW } from '../utils/orderStatus';

export default function OrderProgress({ status }) {
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="progress" aria-label="Order progress">
      {STATUS_FLOW.map((step, i) => {
        const done = i < current || status === 'collected';
        const state = done ? 'is-done' : i === current ? 'is-current' : '';
        return (
          <li key={step} className={state} aria-current={i === current ? 'step' : undefined}>
            <span className="dot">{done && <Check size={14} aria-hidden="true" />}</span>
            {ORDER_STATUS[step].short}
          </li>
        );
      })}
    </ol>
  );
}
