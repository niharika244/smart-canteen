import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import EmptyState from '../../components/EmptyState';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

// Outer component waits for the menu to load, so the form starts with the right values.
export default function AdminItemForm() {
  const { id } = useParams();
  const { menu, loading } = useApp();
  if (loading) return <FoodGridSkeleton count={2} />;
  const existing = id ? menu.find((i) => i.id === id) : null;
  if (id && !existing) {
    return <EmptyState icon={SearchX} title="Item not found" text="It may have been deleted." actionLabel="Back to menu" actionTo="/admin/menu" />;
  }
  return <ItemForm existing={existing} />;
}

function ItemForm({ existing }) {
  const navigate = useNavigate();
  const { categories, saveMenuItem } = useApp();
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? categories[0]?.id ?? '',
    price: existing ? String(existing.price) : '',
    prepMins: existing ? String(existing.prepMins) : '',
    veg: existing ? (existing.veg ? 'yes' : 'no') : 'yes',
    description: existing?.description ?? '',
    allergens: existing ? existing.allergens.join(', ') : '',
    available: existing?.available ?? true,
    limited: Boolean(existing?.dailyLimit),
    dailyLimit: existing?.dailyLimit ? String(existing.dailyLimit) : '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const isWhole = (v, min, max) => /^\d+$/.test(v.trim()) && Number(v) >= min && Number(v) <= max;

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    const name = form.name.trim();
    if (name.length < 2 || name.length > 60) next.name = 'Name must be 2 to 60 characters.';
    if (!categories.some((c) => c.id === form.category)) next.category = 'Choose a category.';
    if (!isWhole(form.price, 1, 2000)) next.price = 'Enter a whole price from 1 to 2000.';
    if (!isWhole(form.prepMins, 1, 60)) next.prepMins = 'Enter preparation minutes from 1 to 60.';
    const description = form.description.trim();
    if (description.length < 5 || description.length > 200) next.description = 'Description must be 5 to 200 characters.';
    if (form.limited && !isWhole(form.dailyLimit, 1, 500)) next.dailyLimit = 'Enter a daily limit from 1 to 500.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    saveMenuItem({
      ...(existing ? { id: existing.id } : {}),
      name,
      category: form.category,
      price: Number(form.price),
      prepMins: Number(form.prepMins),
      veg: form.veg === 'yes',
      description,
      allergens: form.allergens.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean),
      available: form.available,
      dailyLimit: form.limited ? Number(form.dailyLimit) : null,
    });
    navigate('/admin/menu');
  }

  const field = (key, label, input, hint) => (
    <div className="field">
      <label htmlFor={`f-${key}`}>{label}</label>
      {input}
      {hint && <p className="hint">{hint}</p>}
      {errors[key] && <p id={`f-${key}-error`} className="field-error" role="alert">{errors[key]}</p>}
    </div>
  );
  const common = (key) => ({
    id: `f-${key}`, 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `f-${key}-error` : undefined,
    className: `input ${errors[key] ? 'input--error' : ''}`,
  });

  return (
    <div>
      <Link to="/admin/menu" className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Menu management</Link>
      <header className="page-head"><h1>{existing ? `Edit ${existing.name}` : 'Add menu item'}</h1></header>

      <form className="panel form-card" onSubmit={handleSubmit} noValidate>
        {field('name', 'Name', <input {...common('name')} value={form.name} onChange={set('name')} maxLength={60} />)}
        {field('category', 'Category', (
          <select {...common('category')} value={form.category} onChange={set('category')}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ))}
        <div className="form-row">
          {field('price', 'Price (₹)', <input {...common('price')} value={form.price} onChange={set('price')} inputMode="numeric" />)}
          {field('prepMins', 'Preparation time (min)', <input {...common('prepMins')} value={form.prepMins} onChange={set('prepMins')} inputMode="numeric" />)}
        </div>
        <fieldset className="option-list">
          <legend>Diet</legend>
          <label className="option"><input type="radio" name="veg" value="yes" checked={form.veg === 'yes'} onChange={set('veg')} /><span><strong>Vegetarian</strong></span></label>
          <label className="option"><input type="radio" name="veg" value="no" checked={form.veg === 'no'} onChange={set('veg')} /><span><strong>Non-vegetarian</strong></span></label>
        </fieldset>
        {field('description', 'Description', <textarea {...common('description')} rows={3} value={form.description} onChange={set('description')} maxLength={200} />)}
        {field('allergens', 'Allergens', <input {...common('allergens')} value={form.allergens} onChange={set('allergens')} />, 'Separate with commas, for example: gluten, dairy. Leave empty if none.')}
        <label className="check"><input type="checkbox" checked={form.available} onChange={set('available')} /> Available to order</label>
        <label className="check"><input type="checkbox" checked={form.limited} onChange={set('limited')} /> Limited quantity item</label>
        {form.limited && field('dailyLimit', 'Daily limit', <input {...common('dailyLimit')} value={form.dailyLimit} onChange={set('dailyLimit')} inputMode="numeric" />, 'This marks the item as limited for students. The demo does not stop orders at the limit; a backend would enforce it.')}

        <div className="btn-row btn-row--left">
          <button type="submit" className="btn btn-primary">{existing ? 'Save changes' : 'Add item'}</button>
          <Link to="/admin/menu" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
