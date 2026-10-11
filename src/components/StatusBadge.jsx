import { ORDER_STATUS } from '../utils/orderStatus';

export default function StatusBadge({ status }) {
  const info = ORDER_STATUS[status];
  return <span className={`status-badge status-badge--${status}`}>{info ? info.label : status}</span>;
}
