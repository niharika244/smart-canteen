// Transparent, rule-based estimates (NOT machine learning).
// A real backend can replace these using live queue data and order history.
const BUSY_ORDERS_PER_COOK = 3;
const VERY_BUSY_ORDERS_PER_COOK = 5;

export function getKitchenStatus(kitchen) {
  if (kitchen.paused) {
    return { level: 'paused', label: 'New orders paused', message: 'The kitchen is not taking new orders right now.', waitMins: null };
  }
  const perCook = kitchen.ordersInQueue / Math.max(kitchen.cooksOnDuty, 1);
  const waitMins = Math.round(perCook * kitchen.avgMinutesPerOrder);

  if (perCook >= VERY_BUSY_ORDERS_PER_COOK) {
    return { level: 'busy', label: 'Very busy', message: `Expect roughly ${waitMins} min before your order starts. Consider a later pickup.`, waitMins };
  }
  if (perCook >= BUSY_ORDERS_PER_COOK) {
    return { level: 'busy', label: 'Getting busy', message: `About ${waitMins} min of orders ahead of a new one.`, waitMins };
  }
  return { level: 'normal', label: 'Kitchen running smoothly', message: `About ${waitMins} min of orders ahead of a new one.`, waitMins };
}

// Wait before your order starts + the slowest item in your order.
export function estimateOrderMinutes(items, kitchen) {
  const { waitMins } = getKitchenStatus(kitchen);
  const longestPrep = Math.max(0, ...items.map((i) => i.prepMins));
  return (waitMins ?? 0) + longestPrep;
}
