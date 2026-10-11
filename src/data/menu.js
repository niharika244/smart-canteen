// Seed data. Allergen info is sample text only and must be verified by the canteen before real use.
// Photos: optional. Put files at public/images/food/<id>.jpg and they will show up automatically.
export const CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'rolls', name: 'Rolls & Sandwiches' },
  { id: 'meals', name: 'Rice & Meals' },
  { id: 'beverages', name: 'Beverages' },
];

const item = (id, name, category, price, veg, prepMins, description, allergens, extra = {}) => ({
  id, name, category, price, veg, prepMins, description, allergens,
  image: `/images/food/${id}.jpg`,
  available: true,
  popular: false,
  ...extra,
});

export const MENU_ITEMS = [
  item('masala-dosa', 'Masala Dosa', 'breakfast', 60, true, 8, 'Crisp rice-and-lentil crepe filled with spiced potato, served with sambar and chutney.', ['mustard'], { popular: true }),
  item('idli-sambar', 'Idli Sambar (3 pcs)', 'breakfast', 40, true, 5, 'Soft steamed idlis with sambar and coconut chutney.', ['coconut'], { popular: true }),
  item('medu-vada', 'Medu Vada (2 pcs)', 'breakfast', 35, true, 6, 'Crisp urad dal fritters served with sambar.', []),
  item('poha', 'Poha', 'breakfast', 30, true, 5, 'Flattened rice cooked with onion, peanuts and curry leaves.', ['peanuts']),
  item('samosa', 'Samosa', 'snacks', 20, true, 3, 'Crisp pastry stuffed with spiced potato and peas.', ['gluten'], { popular: true }),
  item('veg-puff', 'Veg Puff', 'snacks', 25, true, 3, 'Flaky baked puff with a mildly spiced vegetable filling.', ['gluten']),
  item('french-fries', 'French Fries', 'snacks', 50, true, 6, 'Salted potato fries served hot.', []),
  item('veg-sandwich', 'Grilled Veg Sandwich', 'rolls', 50, true, 6, 'Grilled sandwich with cucumber, tomato, onion and green chutney.', ['gluten']),
  item('paneer-roll', 'Paneer Roll', 'rolls', 80, true, 9, 'Spiced paneer and onions wrapped in a soft paratha.', ['gluten', 'dairy'], { popular: true }),
  item('egg-roll', 'Egg Roll', 'rolls', 70, false, 9, 'Egg-layered paratha rolled with onions and sauce.', ['gluten', 'egg']),
  item('chicken-roll', 'Chicken Roll', 'rolls', 90, false, 10, 'Marinated chicken pieces with onions in a soft paratha.', ['gluten'], { available: false }),
  item('veg-fried-rice', 'Veg Fried Rice', 'meals', 90, true, 10, 'Wok-tossed rice with vegetables and soy sauce.', ['soy']),
  item('rajma-rice', 'Rajma Rice Bowl', 'meals', 80, true, 8, 'Kidney bean curry served over steamed rice.', []),
  item('chicken-biryani', 'Chicken Biryani', 'meals', 120, false, 12, 'Fragrant basmati rice layered with spiced chicken, with raita.', ['dairy'], { popular: true }),
  item('curd-rice', 'Curd Rice', 'meals', 50, true, 4, 'Cool rice mixed with yogurt, tempered with mustard and curry leaves.', ['dairy', 'mustard']),
  item('filter-coffee', 'Filter Coffee', 'beverages', 20, true, 3, 'Strong South Indian coffee with milk.', ['dairy'], { popular: true }),
  item('masala-chai', 'Masala Chai', 'beverages', 15, true, 3, 'Milk tea brewed with ginger and cardamom.', ['dairy']),
  item('fresh-lime-soda', 'Fresh Lime Soda', 'beverages', 30, true, 3, 'Fresh lime with soda, sweet or salted.', []),
  item('cold-coffee', 'Cold Coffee', 'beverages', 45, true, 4, 'Chilled blended coffee with milk.', ['dairy'], { available: false }),
];
