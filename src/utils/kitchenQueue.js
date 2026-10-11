import { QUEUE_STATUSES } from './orderStatus';

// Which statuses need attention first. Lower number = higher priority.
const RANK = { placed: 0, preparing: 1, accepted: 2, ready: 3 };

export function isDelayed(order, nowMs) {
  return QUEUE_STATUSES.includes(order.status) && new Date(order.estimatedReadyAt).getTime() < nowMs;
}

// Priority queue: delayed orders first, then new orders, preparing, accepted, ready; oldest first within each group.
export function sortByPriority(orders, nowMs) {
  const score = (o) => (RANK[o.status] ?? 9) + (isDelayed(o, nowMs) ? -10 : 0);
  return [...orders].sort((a, b) => score(a) - score(b) || a.createdAt.localeCompare(b.createdAt));
}

// Matches "1004", "SC-1004" or part of the customer's name.
export function matchesSearch(order, query) {
  const term = query.trim().toLowerCase().replace(/^sc-/, '');
  if (!term) return true;
  return order.number.toLowerCase().replace('sc-', '').includes(term) || order.customerName.toLowerCase().includes(term);
}
