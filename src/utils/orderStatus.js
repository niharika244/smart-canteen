// Single source of truth for order statuses. The student, kitchen and admin views all use this.
export const ORDER_STATUS = {
  placed: { label: 'Order placed', short: 'Placed', explain: 'Your order was sent to the kitchen. It is waiting for the kitchen to accept it.' },
  accepted: { label: 'Accepted', short: 'Accepted', explain: 'The kitchen accepted your order. Cooking will start soon.' },
  preparing: { label: 'Preparing', short: 'Preparing', explain: 'Your food is being prepared.' },
  ready: { label: 'Ready for pickup', short: 'Ready', explain: 'Your order is ready. Collect it at the counter and show your order number.' },
  collected: { label: 'Collected', short: 'Collected', explain: 'You have collected this order. Enjoy your meal!' },
  cancelled: { label: 'Cancelled', short: 'Cancelled', explain: 'This order was cancelled.' },
  rejected: { label: 'Rejected', short: 'Rejected', explain: 'The kitchen could not take this order.' },
};

export const STATUS_FLOW = ['placed', 'accepted', 'preparing', 'ready', 'collected'];
export const ACTIVE_STATUSES = ['placed', 'accepted', 'preparing', 'ready'];
// Orders the kitchen still has to cook (used for queue length and delay checks).
export const QUEUE_STATUSES = ['placed', 'accepted', 'preparing'];

export const nextStatus = (status) => STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1] ?? null;
export const isActive = (order) => ACTIVE_STATUSES.includes(order.status);

// Default cancellation rule. Admin settings can change the allowed statuses.
// A real backend must enforce this too, because frontend checks can be bypassed.
export const CANCELLABLE_STATUSES = ['placed'];
export const canCancel = (order, allowed = CANCELLABLE_STATUSES) => allowed.includes(order.status);
