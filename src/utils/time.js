const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
const dayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric' });

export const formatTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '');
export const formatDateTime = (iso) => (iso ? dateTimeFmt.format(new Date(iso)) : '');
export const addMinutes = (iso, mins) => new Date(new Date(iso).getTime() + mins * 60000).toISOString();
export const minutesUntil = (iso, nowMs) => Math.ceil((new Date(iso).getTime() - nowMs) / 60000);

// Local calendar date as YYYY-MM-DD (matches <input type="date"> values).
export function toDateKey(value) {
  const d = new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
export const formatDayKey = (key) => dayFmt.format(new Date(`${key}T12:00:00`));

// The time the student should plan around: the chosen pickup slot, unless the kitchen's
// estimate has moved past it (for example after a delay).
export function orderTargetTime(order) {
  const slotIsRealistic = order.pickupAt
    && new Date(order.pickupAt).getTime() >= new Date(order.estimatedReadyAt).getTime() - 2 * 60000;
  return slotIsRealistic ? order.pickupAt : order.estimatedReadyAt;
}

export function orderTimeText(order) {
  const target = orderTargetTime(order);
  return { label: target === order.pickupAt ? 'Pickup time' : 'Estimated ready', time: formatTime(target) };
}
