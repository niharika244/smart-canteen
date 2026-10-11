// Report calculations. Real orders come from this browser; "sample" orders are generated demo history
// so the charts have something to show. Sample data is clearly labelled in the UI and is NOT real business data.
import { MENU_ITEMS } from '../data/menu';
import { toDateKey } from '../utils/time';

const SAMPLE_DAYS = 14;
const EXCLUDED_STATUSES = ['cancelled', 'rejected'];
const HOUR_WEIGHTS = { 8: 3, 9: 4, 10: 3, 11: 2, 12: 7, 13: 8, 14: 4, 15: 3, 16: 2 };

// Small seeded random generator: same numbers every time, so charts don't change on each render.
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(entries, rand) {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

let sampleCache = null;
export function getSampleOrders() {
  if (sampleCache) return sampleCache;
  const rand = mulberry32(2026);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const itemEntries = MENU_ITEMS.map((i) => [i, i.popular ? 4 : 1]);
  const hourEntries = Object.entries(HOUR_WEIGHTS).map(([h, w]) => [Number(h), w]);
  const orders = [];

  for (let d = SAMPLE_DAYS; d >= 1; d -= 1) {
    const count = 18 + Math.floor(rand() * 14);
    for (let k = 0; k < count; k += 1) {
      const when = new Date(today);
      when.setDate(today.getDate() - d);
      when.setHours(weightedPick(hourEntries, rand), Math.floor(rand() * 60), 0, 0);

      const lineCount = 1 + Math.floor(rand() * 3);
      const lines = new Map();
      for (let n = 0; n < lineCount; n += 1) {
        const item = weightedPick(itemEntries, rand);
        const qty = rand() < 0.2 ? 2 : 1;
        const prev = lines.get(item.id);
        lines.set(item.id, { itemId: item.id, name: item.name, price: item.price, qty: (prev ? prev.qty : 0) + qty });
      }
      const items = [...lines.values()];
      orders.push({
        id: `sample-${d}-${k}`,
        number: `S-${d}${String(k).padStart(2, '0')}`,
        createdAt: when.toISOString(),
        items,
        total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
        status: 'collected',
        sample: true,
      });
    }
  }
  sampleCache = orders;
  return orders;
}

export function getReportOrders(realOrders, from, to) {
  return [...realOrders, ...getSampleOrders()]
    .filter((o) => {
      const key = toDateKey(o.createdAt);
      return key >= from && key <= to;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const countsAsSale = (order) => !EXCLUDED_STATUSES.includes(order.status);

function dateKeysBetween(from, to) {
  const keys = [];
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cursor <= end && keys.length < 62) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function summarize(orders, from, to) {
  const valid = orders.filter(countsAsSale);
  const byDayMap = new Map(dateKeysBetween(from, to).map((k) => [k, { key: k, orders: 0, sales: 0 }]));
  const itemMap = new Map();

  valid.forEach((o) => {
    const day = byDayMap.get(toDateKey(o.createdAt));
    if (day) { day.orders += 1; day.sales += o.total; }
    o.items.forEach((i) => {
      const row = itemMap.get(i.itemId) || { itemId: i.itemId, name: i.name, units: 0, revenue: 0 };
      row.units += i.qty;
      row.revenue += i.price * i.qty;
      itemMap.set(i.itemId, row);
    });
  });

  const sales = valid.reduce((sum, o) => sum + o.total, 0);
  return {
    valid,
    orderCount: valid.length,
    sales,
    avgOrder: valid.length ? Math.round(sales / valid.length) : 0,
    byDay: [...byDayMap.values()],
    topItems: [...itemMap.values()].sort((a, b) => b.units - a.units),
  };
}

// Orders (or units of one item) per hour of the day.
export function demandByHour(validOrders, itemId, fromHour = 8, toHour = 17) {
  const buckets = new Map();
  for (let h = fromHour; h <= toHour; h += 1) buckets.set(h, 0);
  validOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (!buckets.has(hour)) return;
    if (!itemId) { buckets.set(hour, buckets.get(hour) + 1); return; }
    const line = o.items.find((i) => i.itemId === itemId);
    if (line) buckets.set(hour, buckets.get(hour) + line.qty);
  });
  return [...buckets.entries()].map(([hour, value]) => ({ hour, value }));
}
