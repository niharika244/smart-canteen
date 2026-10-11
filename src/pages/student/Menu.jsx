import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { filterAndSortMenu } from '../../utils/menuFilters';
import FoodCard from '../../components/FoodCard';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function Menu() {
  const { menu, categories, college, profile, loading, error, reload } = useApp();
  // Filters live in the URL (?q=dosa&category=breakfast) so links and the back button work.
  const [params, setParams] = useSearchParams();
  // Diet: URL wins; if the URL has no diet, use the profile preference. diet=all means "show everything".
  const profileDiet = profile.diet || '';
  const dietParam = params.get('diet');
  const diet = dietParam === null ? profileDiet : dietParam === 'all' ? '' : dietParam;

  const filters = useMemo(() => ({
    q: params.get('q') || '',
    category: params.get('category') || '',
    diet,
    availableOnly: params.get('available') === '1',
    maxPrice: params.get('maxPrice') || '',
    sort: params.get('sort') || 'popular',
  }), [params, diet]);

  const results = useMemo(() => filterAndSortMenu(menu, filters), [menu, filters]);
  const hasFilters = Boolean(filters.q || filters.category || filters.diet || filters.availableOnly || filters.maxPrice);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <div>
      <header className="page-head">
        <h1>Menu</h1>
        <p>{college ? `${college.canteen}, ${college.name}` : ''}</p>
      </header>

      <div className="filters">
        <div className="field field--grow">
          <label htmlFor="menu-q">Search</label>
          <input id="menu-q" type="search" className="input" placeholder="Search dosa, coffee, roll…" value={filters.q} onChange={(e) => setParam('q', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="menu-diet">Diet</label>
          <select id="menu-diet" className="input" value={filters.diet || 'all'} onChange={(e) => setParam('diet', e.target.value)}>
            <option value="all">All</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-vegetarian</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="menu-price">Budget</label>
          <select id="menu-price" className="input" value={filters.maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)}>
            <option value="">Any budget</option>
            <option value="30">Up to ₹30</option>
            <option value="60">Up to ₹60</option>
            <option value="100">Up to ₹100</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="menu-sort">Sort by</label>
          <select id="menu-sort" className="input" value={filters.sort} onChange={(e) => setParam('sort', e.target.value === 'popular' ? '' : e.target.value)}>
            <option value="popular">Most popular</option>
            <option value="fastest">Quickest to prepare</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={filters.availableOnly} onChange={(e) => setParam('available', e.target.checked ? '1' : '')} />
          Available only
        </label>
      </div>

      <div className="chip-row" role="group" aria-label="Categories">
        <button type="button" className="chip" aria-pressed={!filters.category} onClick={() => setParam('category', '')}>All</button>
        {categories.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={filters.category === c.id} onClick={() => setParam('category', c.id)}>{c.name}</button>
        ))}
      </div>

      {loading && <FoodGridSkeleton count={8} />}

      {error && (
        <div className="empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="result-count" aria-live="polite">{results.length} {results.length === 1 ? 'dish' : 'dishes'}</p>
          {results.length === 0 ? (
            <div className="empty">
              <SearchX size={32} aria-hidden="true" />
              <h2>No dishes match these filters</h2>
              <p>Try a higher budget, a different category, or clear the filters.</p>
              {hasFilters && <button type="button" className="btn btn-primary" onClick={() => setParams(profileDiet ? { diet: 'all' } : {}, { replace: true })}>Clear filters</button>}
            </div>
          ) : (
            <div className="food-grid">{results.map((item) => <FoodCard key={item.id} item={item} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
