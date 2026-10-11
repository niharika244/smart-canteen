import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { STAFF_ROLES } from '../../data/college';
import ConfirmDialog from '../../components/ConfirmDialog';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminStaff() {
  const { staff, loading, addStaff, updateStaffRole, removeStaff } = useApp();
  const [form, setForm] = useState({ name: '', email: '', role: 'kitchen' });
  const [errors, setErrors] = useState({});
  const [toRemove, setToRemove] = useState(null);

  function handleAdd(e) {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter the staff member\'s name.';
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address.';
    else if (staff.some((s) => s.email.toLowerCase() === form.email.trim().toLowerCase())) next.email = 'This email is already on the list.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    addStaff({ name: form.name.trim(), email: form.email.trim(), role: form.role });
    setForm({ name: '', email: '', role: 'kitchen' });
  }

  return (
    <div>
      <header className="page-head"><h1>Staff</h1><p>Manage who works in the canteen and their roles.</p></header>
      <div className="alert alert--warn" style={{ margin: '16px 0' }}>
        Prototype only: this list does not create real accounts, passwords or permissions. A backend must handle sign-in and enforce roles.
      </div>

      {loading ? <FoodGridSkeleton count={2} /> : (
        <div className="table-wrap">
          <table className="resp-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td data-label="Name"><strong>{s.name}</strong></td>
                  <td data-label="Email">{s.email}</td>
                  <td data-label="Role">
                    <label className="sr-only" htmlFor={`role-${s.id}`}>Role for {s.name}</label>
                    <select id={`role-${s.id}`} className="input" value={s.role} onChange={(e) => updateStaffRole(s.id, e.target.value)}>
                      {Object.entries(STAFF_ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td data-label="Actions"><button type="button" className="icon-btn" aria-label={`Remove ${s.name}`} onClick={() => setToRemove(s)}><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="panel form-card section" onSubmit={handleAdd} noValidate>
        <h2>Add staff member</h2>
        <div className="field">
          <label htmlFor="s-name">Name</label>
          <input id="s-name" className={`input ${errors.name ? 'input--error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="s-email">Email</label>
          <input id="s-email" type="email" className={`input ${errors.email ? 'input--error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="s-role">Role</label>
          <select id="s-role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.entries(STAFF_ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Add staff member</button>
      </form>

      {toRemove && (
        <ConfirmDialog
          title={`Remove ${toRemove.name}?`} message="They will be removed from this list."
          confirmLabel="Remove" onConfirm={() => { removeStaff(toRemove.id); setToRemove(null); }} onCancel={() => setToRemove(null)}
        />
      )}
    </div>
  );
}
