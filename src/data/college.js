// Demo identity only. These are fictional names, not real institutions.
// In the real product, colleges, canteens and settings come from the backend, with each college's data isolated server-side.
export const DEMO_COLLEGES = [
  { id: 'demo-college', name: 'Demo College', canteens: ['Main Canteen', 'Food Court'] },
  { id: 'sample-institute', name: 'Sample Institute of Technology', canteens: ['Central Canteen'] },
];

export const DEFAULT_SETTINGS = {
  collegeId: 'demo-college',
  collegeName: 'Demo College',
  canteenName: 'Main Canteen',
  opensAt: '08:00',
  closesAt: '17:00',
  // Which order statuses a student may still cancel from. Admin can change this.
  cancellableStatuses: ['placed'],
  // Inputs for the simple wait-time estimate (see services/estimateService.js)
  cooksOnDuty: 2,
  avgMinutesPerOrder: 4,
  baseQueue: 2, // demo baseline: counter/walk-up orders already in the kitchen
  paused: false, // kitchen has paused new orders
};

export const STAFF_SEED = [
  { id: 'st-1', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'kitchen' },
  { id: 'st-2', name: 'Meena Iyer', email: 'meena@example.com', role: 'manager' },
  { id: 'st-3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

export const STAFF_ROLES = {
  kitchen: 'Kitchen staff',
  manager: 'Canteen manager',
  admin: 'College admin',
};
