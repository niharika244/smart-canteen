// One shared store so the student, kitchen and admin views all see the same data.
// Menu, settings and staff are saved through services/canteenService.js (mock backend).
// Cart, favorites, orders and profile are saved in this browser's localStorage.
// That is demo-only: NOT real storage, not secure, and not shared between devices.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../services/canteenService';
import { CATEGORIES, MENU_ITEMS } from '../data/menu';
import { DEFAULT_SETTINGS, STAFF_SEED } from '../data/college';
import { estimateOrderMinutes } from '../services/estimateService';
import { QUEUE_STATUSES, canCancel } from '../utils/orderStatus';
import { addMinutes } from '../utils/time';

export const AppContext = createContext(null);
const MAX_QTY = 10;
const FIRST_ORDER_SEQ = 1001;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function AppProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [staff, setStaff] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cart, setCart] = useState(() => readStorage('sc_cart', [])); // [{ itemId, qty }]
  const [favorites, setFavorites] = useState(() => readStorage('sc_favorites', []));
  const [orders, setOrders] = useState(() => readStorage('sc_orders', [])); // newest first
  const [profile, setProfile] = useState(() => readStorage('sc_profile', { name: '', phone: '', diet: '' }));
  const [welcomed, setWelcomed] = useState(() => readStorage('sc_welcomed', false));
  const [cartOpen, setCartOpen] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.loadInitialData();
      setMenu(data.menu);
      setCategories(data.categories);
      setSettings(data.settings);
      setStaff(data.staff);
      setLoaded(true);
    } catch {
      setError('We could not load the menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Save only after the first load, so we never overwrite stored data with empty defaults.
  useEffect(() => { if (loaded) api.saveMenu(menu); }, [menu, loaded]);
  useEffect(() => { if (loaded) api.saveCategories(categories); }, [categories, loaded]);
  useEffect(() => { if (loaded) api.saveSettings(settings); }, [settings, loaded]);
  useEffect(() => { if (loaded) api.saveStaff(staff); }, [staff, loaded]);
  useEffect(() => { localStorage.setItem('sc_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sc_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('sc_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('sc_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('sc_welcomed', JSON.stringify(welcomed)); }, [welcomed]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  // ---------- derived data ----------
  const college = useMemo(() => ({
    id: settings.collegeId,
    name: settings.collegeName,
    canteen: settings.canteenName,
    hours: `${settings.opensAt} – ${settings.closesAt}`,
  }), [settings]);

  const queueCount = useMemo(() => orders.filter((o) => QUEUE_STATUSES.includes(o.status)).length, [orders]);

  // Kitchen load = real orders waiting in this demo + a configurable baseline for walk-up orders.
  const kitchen = useMemo(() => ({
    paused: settings.paused,
    cooksOnDuty: settings.cooksOnDuty,
    avgMinutesPerOrder: settings.avgMinutesPerOrder,
    ordersInQueue: settings.baseQueue + queueCount,
  }), [settings, queueCount]);

  // ---------- cart ----------
  const addToCart = useCallback((itemId) => {
    const item = menu.find((m) => m.id === itemId);
    if (!item || !item.available) return; // never add unavailable food
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId);
      if (!existing) return [...prev, { itemId, qty: 1 }];
      return prev.map((c) => (c.itemId === itemId ? { ...c, qty: Math.min(c.qty + 1, MAX_QTY) } : c));
    });
  }, [menu]);

  const setQty = useCallback((itemId, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.itemId !== itemId)
        : prev.map((c) => (c.itemId === itemId ? { ...c, qty: Math.min(qty, MAX_QTY) } : c))
    );
  }, []);

  const removeFromCart = useCallback((itemId) => setCart((prev) => prev.filter((c) => c.itemId !== itemId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((itemId) => {
    setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  }, []);

  // Join cart entries with menu data. Entries whose item no longer exists are dropped.
  const cartLines = useMemo(
    () => cart.map(({ itemId, qty }) => {
      const item = menu.find((m) => m.id === itemId);
      return item ? { item, qty } : null;
    }).filter(Boolean),
    [cart, menu]
  );
  const cartCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0);

  // ---------- orders ----------
  // A real backend must re-validate prices, availability, opening hours and kitchen capacity on the server.
  const placeOrder = useCallback(({ customerName, notes, pickupAt }) => {
    if (cartLines.length === 0) return { ok: false, error: 'Your cart is empty.' };
    if (kitchen.paused) return { ok: false, error: 'The kitchen is not taking new orders right now.' };
    if (cartLines.some((l) => !l.item.available)) {
      return { ok: false, error: 'Some items are no longer available. Please remove them from your cart.' };
    }

    const createdAt = new Date().toISOString();
    const estimateMins = estimateOrderMinutes(cartLines.map((l) => l.item), kitchen);
    const seq = orders.reduce((max, o) => Math.max(max, o.seq), FIRST_ORDER_SEQ - 1) + 1;

    // Item names and prices are copied into the order, so later menu edits don't change past orders.
    const order = {
      id: `ord-${seq}`,
      seq,
      number: `SC-${seq}`,
      items: cartLines.map(({ item, qty }) => ({
        itemId: item.id, name: item.name, price: item.price, prepMins: item.prepMins, veg: item.veg, qty,
      })),
      total: cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0),
      status: 'placed',
      customerName,
      notes,
      pickupAt: pickupAt || null,
      createdAt,
      estimateMins,
      estimatedReadyAt: addMinutes(createdAt, estimateMins),
      estimateAdjustedMins: 0,
      statusHistory: [{ status: 'placed', at: createdAt }],
    };

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return { ok: true, order };
  }, [cartLines, kitchen, orders]);

  // Generic status change used by students (cancel) and the kitchen (accept, reject, prepare...).
  const updateOrderStatus = useCallback((orderId, status, extra = {}) => {
    const at = new Date().toISOString();
    setOrders((prev) => prev.map((o) => (
      o.id === orderId ? { ...o, ...extra, status, statusHistory: [...o.statusHistory, { status, at }] } : o
    )));
  }, []);

  // Kitchen adds (or removes) minutes when an order is running late.
  const adjustOrderEstimate = useCallback((orderId, deltaMins) => {
    setOrders((prev) => prev.map((o) => (
      o.id === orderId
        ? { ...o, estimatedReadyAt: addMinutes(o.estimatedReadyAt, deltaMins), estimateAdjustedMins: (o.estimateAdjustedMins || 0) + deltaMins }
        : o
    )));
  }, []);

  const cancelOrder = useCallback((orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !canCancel(order, settings.cancellableStatuses)) return false;
    updateOrderStatus(orderId, 'cancelled');
    return true;
  }, [orders, settings.cancellableStatuses, updateOrderStatus]);

  // Puts the available items of an earlier order back in the cart.
  const reorder = useCallback((orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { added: 0, skipped: [] };

    const toAdd = [];
    const skipped = [];
    order.items.forEach((line) => {
      const item = menu.find((m) => m.id === line.itemId);
      if (!item || !item.available) skipped.push(line.name);
      else toAdd.push({ itemId: item.id, qty: line.qty });
    });

    if (toAdd.length > 0) {
      setCart((prev) => {
        const next = [...prev];
        toAdd.forEach(({ itemId, qty }) => {
          const index = next.findIndex((c) => c.itemId === itemId);
          if (index === -1) next.push({ itemId, qty: Math.min(qty, MAX_QTY) });
          else next[index] = { ...next[index], qty: Math.min(next[index].qty + qty, MAX_QTY) };
        });
        return next;
      });
    }
    return { added: toAdd.length, skipped };
  }, [orders, menu]);

  // ---------- menu management (admin / kitchen) ----------
  const setItemAvailability = useCallback((itemId, available) => {
    setMenu((prev) => prev.map((i) => (i.id === itemId ? { ...i, available } : i)));
  }, []);

  // Adds a new item (no id) or updates an existing one. Returns the item's id.
  const saveMenuItem = useCallback((data) => {
    if (data.id && menu.some((i) => i.id === data.id)) {
      setMenu((prev) => prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)));
      return data.id;
    }
    const base = slugify(data.name) || 'item';
    let id = base;
    let n = 2;
    while (menu.some((i) => i.id === id)) { id = `${base}-${n}`; n += 1; }
    setMenu((prev) => [...prev, { popular: false, ...data, id, image: `/images/food/${id}.jpg` }]);
    return id;
  }, [menu]);

  const deleteMenuItem = useCallback((itemId) => {
    setMenu((prev) => prev.filter((i) => i.id !== itemId));
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
    setFavorites((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const addCategory = useCallback((name) => {
    const clean = name.trim();
    const id = slugify(clean);
    if (!id) return { ok: false, error: 'Enter a category name.' };
    if (categories.some((c) => c.id === id || c.name.toLowerCase() === clean.toLowerCase())) return { ok: false, error: 'That category already exists.' };
    setCategories((prev) => [...prev, { id, name: clean }]);
    return { ok: true };
  }, [categories]);

  const renameCategory = useCallback((id, name) => {
    const clean = name.trim();
    if (!clean) return { ok: false, error: 'Enter a category name.' };
    if (categories.some((c) => c.id !== id && c.name.toLowerCase() === clean.toLowerCase())) return { ok: false, error: 'That category already exists.' };
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: clean } : c)));
    return { ok: true };
  }, [categories]);

  const deleteCategory = useCallback((id) => {
    if (menu.some((i) => i.category === id)) return { ok: false, error: 'Move or delete the items in this category first.' };
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { ok: true };
  }, [menu]);

  // ---------- staff (UI only: no real accounts or passwords) ----------
  const addStaff = useCallback(({ name, email, role }) => {
    setStaff((prev) => [...prev, { id: `st-${Date.now()}`, name, email, role }]);
  }, []);
  const updateStaffRole = useCallback((id, role) => setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s))), []);
  const removeStaff = useCallback((id) => setStaff((prev) => prev.filter((s) => s.id !== id)), []);

  // ---------- settings, profile, demo ----------
  const updateSettings = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), []);
  const updateProfile = useCallback((patch) => setProfile((prev) => ({ ...prev, ...patch })), []);

  const completeWelcome = useCallback((collegeId, collegeName, canteenName) => {
    setSettings((prev) => ({ ...prev, collegeId, collegeName, canteenName }));
    setWelcomed(true);
  }, []);

  const resetDemoData = useCallback(() => { setCart([]); setOrders([]); setFavorites([]); }, []);
  const resetCatalog = useCallback(() => {
    setMenu(MENU_ITEMS.map((i) => ({ ...i })));
    setCategories(CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
    setStaff(STAFF_SEED);
  }, []);

  const value = {
    menu, categories, college, kitchen, settings, staff, loading, error, reload,
    cart, cartLines, cartCount, cartTotal, cartOpen, openCart, closeCart,
    addToCart, setQty, removeFromCart, clearCart,
    favorites, toggleFavorite,
    orders, placeOrder, updateOrderStatus, adjustOrderEstimate, cancelOrder, reorder,
    setItemAvailability, saveMenuItem, deleteMenuItem, addCategory, renameCategory, deleteCategory,
    addStaff, updateStaffRole, removeStaff,
    updateSettings, profile, updateProfile, welcomed, completeWelcome, resetDemoData, resetCatalog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
