import { Minus, Plus } from 'lucide-react';

export default function QtyStepper({ qty, name, onChange, max = 10 }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" onClick={() => onChange(qty - 1)} aria-label={`Decrease ${name}`}><Minus size={16} /></button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} disabled={qty >= max} aria-label={`Increase ${name}`}><Plus size={16} /></button>
    </div>
  );
}
