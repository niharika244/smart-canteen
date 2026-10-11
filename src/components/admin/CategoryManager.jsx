import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import ConfirmDialog from '../ConfirmDialog';

export default function CategoryManager() {
  const { categories, menu, addCategory, renameCategory, deleteCategory } = useApp();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [toDelete, setToDelete] = useState(null);

  const usedCount = (id) => menu.filter((i) => i.category === id).length;
  const show = (result, okText) => setMessage(result.ok ? { type: 'ok', text: okText } : { type: 'error', text: result.error });

  function handleAdd(e) {
    e.preventDefault();
    const result = addCategory(newName);
    show(result, 'Category added.');
    if (result.ok) setNewName('');
  }

  function handleRename(e) {
    e.preventDefault();
    const result = renameCategory(editId, editName);
    show(result, 'Category renamed.');
    if (result.ok) setEditId(null);
  }

  function handleDelete() {
    show(deleteCategory(toDelete.id), 'Category deleted.');
    setToDelete(null);
  }

  return (
    <details className="panel">
      <summary><strong>Manage categories</strong></summary>
      <ul className="items-list" style={{ marginTop: 12 }}>
        {categories.map((c) => (
          <li key={c.id}>
            {editId === c.id ? (
              <form className="row-actions" onSubmit={handleRename}>
                <label className="sr-only" htmlFor="cat-edit">Category name</label>
                <input id="cat-edit" className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <span>{c.name} <span className="note">({usedCount(c.id)} items)</span></span>
                <span className="row-actions">
                  <button type="button" className="icon-btn" aria-label={`Rename ${c.name}`} onClick={() => { setEditId(c.id); setEditName(c.name); setMessage({ type: '', text: '' }); }}><Pencil size={16} /></button>
                  <button type="button" className="icon-btn" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}><Trash2 size={16} /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form className="row-actions" onSubmit={handleAdd} style={{ marginTop: 12 }}>
        <label className="sr-only" htmlFor="cat-new">New category name</label>
        <input id="cat-new" className="input" placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Add category</button>
      </form>
      {message.text && <p className={message.type === 'ok' ? 'alert alert--ok' : 'field-error'} role="status">{message.text}</p>}

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.name}"?`} message="This removes the category. It only works if no menu items use it."
          confirmLabel="Delete category" onConfirm={handleDelete} onCancel={() => setToDelete(null)}
        />
      )}
    </details>
  );
}
