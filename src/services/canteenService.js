// Mock backend. The rest of the app only talks to these functions.
// Later, replace the bodies with fetch('/api/...') calls. Pages and components won't need to change.
// IMPORTANT: localStorage is NOT a database. It is per-browser, editable by the user, and not secure.
import { MENU_ITEMS, CATEGORIES } from '../data/menu';
import { DEFAULT_SETTINGS, STAFF_SEED } from '../data/college';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the demo keeps working in memory only.
  }
}

export async function loadInitialData() {
  await delay(350); // simulates network so loading states are visible
  return {
    menu: read('sc_menu', MENU_ITEMS).map((i) => ({ ...i })),
    categories: read('sc_categories', CATEGORIES),
    settings: { ...DEFAULT_SETTINGS, ...read('sc_settings', {}) },
    staff: read('sc_staff', STAFF_SEED),
  };
}

export const saveMenu = (menu) => write('sc_menu', menu);
export const saveCategories = (categories) => write('sc_categories', categories);
export const saveSettings = (settings) => write('sc_settings', settings);
export const saveStaff = (staff) => write('sc_staff', staff);
