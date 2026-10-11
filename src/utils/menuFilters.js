const SORTERS = {
  popular: (a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  fastest: (a, b) => a.prepMins - b.prepMins,
};

export function filterAndSortMenu(menu, { q, category, diet, availableOnly, maxPrice, sort }) {
  const term = (q || '').trim().toLowerCase();
  const filtered = menu.filter((item) => {
    if (term && !item.name.toLowerCase().includes(term) && !item.description.toLowerCase().includes(term)) return false;
    if (category && item.category !== category) return false;
    if (diet === 'veg' && !item.veg) return false;
    if (diet === 'nonveg' && item.veg) return false;
    if (availableOnly && !item.available) return false;
    if (maxPrice && item.price > Number(maxPrice)) return false;
    return true;
  });
  return filtered.sort(SORTERS[sort] || SORTERS.popular);
}
