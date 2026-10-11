import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';

export default function Profile() {
  const { profile, updateProfile, resetDemoData } = useApp();
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [diet, setDiet] = useState(profile.diet || '');
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const edit = (setter) => (e) => { setter(e.target.value); setSaved(false); };

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (name.trim() && name.trim().length < 2) next.name = 'Name should be at least 2 characters.';
    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) next.phone = 'Enter a 10-digit mobile number, or leave this empty.';
    setErrors(next);
    if (Object.keys(next).length > 0) { setSaved(false); return; }
    updateProfile({ name: name.trim(), phone: phone.trim(), diet });
    setSaved(true);
  }

  function handleReset() {
    if (window.confirm('This clears your cart, orders and favorites in this browser. Continue?')) resetDemoData();
  }

  return (
    <div>
      <header className="page-head">
        <h1>Profile</h1>
        <p>Basic details and preferences.</p>
      </header>

      <div className="alert alert--warn" style={{ margin: '16px 0' }}>
        This prototype has no sign-in. Profile details stay in this browser only.
      </div>

      <form className="panel" onSubmit={handleSubmit} noValidate style={{ maxWidth: 520 }}>
        <div className="field">
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" className={`input ${errors.name ? 'input--error' : ''}`} value={name} onChange={edit(setName)} autoComplete="name"
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'pf-name-error' : undefined} />
          {errors.name && <p id="pf-name-error" className="field-error" role="alert">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="pf-phone">Mobile number <span className="hint">(optional)</span></label>
          <input id="pf-phone" className={`input ${errors.phone ? 'input--error' : ''}`} value={phone} onChange={edit(setPhone)} inputMode="numeric" autoComplete="tel"
            aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'pf-phone-error' : undefined} />
          {errors.phone && <p id="pf-phone-error" className="field-error" role="alert">{errors.phone}</p>}
        </div>
        <div className="field">
          <label htmlFor="pf-diet">Menu preference</label>
          <select id="pf-diet" className="input" value={diet} onChange={edit(setDiet)}>
            <option value="">Show everything</option>
            <option value="veg">Vegetarian only</option>
            <option value="nonveg">Non-vegetarian only</option>
          </select>
          <p className="hint">Used as the default filter on the menu. You can still change it there.</p>
        </div>
        <button type="submit" className="btn btn-primary">Save changes</button>
        {saved && <div className="alert alert--ok" role="status">Saved.</div>}
      </form>

      <div className="section">
        <p><Link to="/favorites" className="link">View your favorites</Link></p>
      </div>

      <div className="section demo-box" style={{ maxWidth: 520 }}>
        <strong>Demo tools</strong>
        <p className="note">Clear your cart, orders and favorites to start testing from scratch.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Reset demo data</button>
      </div>
    </div>
  );
}
