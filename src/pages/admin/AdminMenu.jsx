import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { formatPrice } from '../../utils/format';
import Toggle from '../../components/Toggle';
import VegMark from '../../components/VegMark';
import ConfirmDialog from '../../components/ConfirmDialog';
import CategoryManager from '../../components/admin/CategoryManager';
import EmptyState from '../../components/EmptyState';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function AdminMenu() {
  const { menu, categories, loading, setItemAvailability, deleteMenuItem } = useApp();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? 'Uncategorised';
  const rows = useMemo(() => menu.filter((i) =>
    (!category || i.category === category) && (!q.trim() || i.name.toLowerCase().includes(q.trim().toLowerCase()))
  ), [menu, q, category]);

  return (
    <div>
      <header className="page-head page-head--row">
        <div><h1>Menu management</h1><p>{menu.length} items</p></div>
        <Link to="/admin/menu/new" className="btn btn-primary"><Plus size={18} aria-hidden="true" /> Add item</Link>
      </header>

      <div className="filters filters--simple">
        <div className="field">
          <label htmlFor="am-q">Search</label>
          <input id="am-q" type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" />
        </div>
        <div className="field">
          <label htmlFor="am-cat">Category</label>
          <select id="am-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? <FoodGridSkeleton count={3} /> : rows.length === 0 ? (
        <EmptyState title="No items found" text="Try a different search, or add a new item." actionLabel="Add item" actionTo="/admin/menu/new" />
      ) : (
        <div className="table-wrap">
          <table className="resp-table">
            <thead>
              <tr><th>Item</th><th>Category</th><th>Price</th><th>Prep</th><th>Available</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td data-label="Item">
                    <span className="avail-name"><VegMark veg={i.veg} /> <strong>{i.name}</strong></span>
                    {i.dailyLimit && <span className="badge badge--off" style={{ marginLeft: 8 }}>Limited: {i.dailyLimit}/day</span>}
                  </td>
                  <td data-label="Category">{categoryName(i.category)}</td>
                  <td data-label="Price">{formatPrice(i.price)}</td>
                  <td data-label="Prep">{i.prepMins} min</td>
                  <td data-label="Available"><Toggle checked={i.available} label={`${i.name} available`} onChange={(v) => setItemAvailability(i.id, v)} /></td>
                  <td data-label="Actions">
                    <span className="row-actions">
                      <Link to={`/admin/menu/${i.id}/edit`} className="icon-btn" aria-label={`Edit ${i.name}`}><Pencil size={18} /></Link>
                      <button type="button" className="icon-btn" aria-label={`Delete ${i.name}`} onClick={() => setToDelete(i)}><Trash2 size={18} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section"><CategoryManager /></div>

      {toDelete && (
        <ConfirmDialog
          title={`Delete ${toDelete.name}?`}
          message="This removes the item from the menu, and from students' carts and favorites. Past orders keep their original details."
          confirmLabel="Delete item"
          onConfirm={() => { deleteMenuItem(toDelete.id); setToDelete(null); }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
