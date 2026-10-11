import { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import ConfirmDialog from '../../components/ConfirmDialog';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

const CANCEL_OPTIONS = {
  placed: { label: 'Until the kitchen accepts the order (default)', statuses: ['placed'] },
  accepted: { label: 'Until cooking starts', statuses: ['placed', 'accepted'] },
  never: { label: 'Students cannot cancel', statuses: [] },
};
const cancelKey = (statuses) => (statuses.length === 0 ? 'never' : statuses.includes('accepted') ? 'accepted' : 'placed');

// Wait for settings to load so the form starts with the saved values.
export default function AdminSettings() {
  const { settings, loading } = useApp();
  if (loading) return <FoodGridSkeleton count={2} />;
  return <SettingsForm settings={settings} />;
}

function SettingsForm({ settings }) {
  const { updateSettings, resetCatalog } = useApp();
  const [form, setForm] = useState({
    collegeName: settings.collegeName,
    canteenName: settings.canteenName,
    opensAt: settings.opensAt,
    closesAt: settings.closesAt,
    cancel: cancelKey(settings.cancellableStatuses),
    cooksOnDuty: String(settings.cooksOnDuty),
    avgMinutesPerOrder: String(settings.avgMinutesPerOrder),
    baseQueue: String(settings.baseQueue),
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setSaved(false); };
  const whole = (v, min, max) => /^\d+$/.test(v.trim()) && Number(v) >= min && Number(v) <= max;

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (form.collegeName.trim().length < 2) next.collegeName = 'Enter the college name.';
    if (form.canteenName.trim().length < 2) next.canteenName = 'Enter the canteen name.';
    if (!form.opensAt || !form.closesAt || form.opensAt >= form.closesAt) next.hours = 'Opening time must be earlier than closing time.';
    if (!whole(form.cooksOnDuty, 1, 20)) next.cooksOnDuty = 'Enter 1 to 20.';
    if (!whole(form.avgMinutesPerOrder, 1, 30)) next.avgMinutesPerOrder = 'Enter 1 to 30 minutes.';
    if (!whole(form.baseQueue, 0, 50)) next.baseQueue = 'Enter 0 to 50.';
    setErrors(next);
    if (Object.keys(next).length > 0) { setSaved(false); return; }

    updateSettings({
      collegeName: form.collegeName.trim(),
      canteenName: form.canteenName.trim(),
      opensAt: form.opensAt,
      closesAt: form.closesAt,
      cancellableStatuses: CANCEL_OPTIONS[form.cancel].statuses,
      cooksOnDuty: Number(form.cooksOnDuty),
      avgMinutesPerOrder: Number(form.avgMinutesPerOrder),
      baseQueue: Number(form.baseQueue),
    });
    setSaved(true);
  }

  const err = (key) => errors[key] && <p className="field-error" role="alert">{errors[key]}</p>;

  return (
    <div>
      <header className="page-head"><h1>Settings</h1><p>College, canteen, hours, cancellation and kitchen capacity.</p></header>

      <form className="panel form-card" onSubmit={handleSubmit} noValidate style={{ marginTop: 16 }}>
        <h2>College and canteen</h2>
        <div className="field"><label htmlFor="st-college">College name</label><input id="st-college" className={`input ${errors.collegeName ? 'input--error' : ''}`} value={form.collegeName} onChange={set('collegeName')} />{err('collegeName')}</div>
        <div className="field"><label htmlFor="st-canteen">Canteen name</label><input id="st-canteen" className={`input ${errors.canteenName ? 'input--error' : ''}`} value={form.canteenName} onChange={set('canteenName')} />{err('canteenName')}</div>

        <h2>Operating hours</h2>
        <div className="form-row">
          <div className="field"><label htmlFor="st-open">Opens</label><input id="st-open" type="time" className="input" value={form.opensAt} onChange={set('opensAt')} /></div>
          <div className="field"><label htmlFor="st-close">Closes</label><input id="st-close" type="time" className="input" value={form.closesAt} onChange={set('closesAt')} /></div>
        </div>
        {err('hours')}
        <p className="hint">Shown to students. The demo does not block orders outside these hours; the backend should.</p>

        <h2>Cancellation rule</h2>
        <div className="field">
          <label htmlFor="st-cancel">Students can cancel</label>
          <select id="st-cancel" className="input" value={form.cancel} onChange={set('cancel')}>
            {Object.entries(CANCEL_OPTIONS).map(([key, o]) => <option key={key} value={key}>{o.label}</option>)}
          </select>
        </div>

        <h2>Kitchen capacity (used for wait estimates)</h2>
        <div className="form-row">
          <div className="field"><label htmlFor="st-cooks">Cooks on duty</label><input id="st-cooks" className={`input ${errors.cooksOnDuty ? 'input--error' : ''}`} value={form.cooksOnDuty} onChange={set('cooksOnDuty')} inputMode="numeric" />{err('cooksOnDuty')}</div>
          <div className="field"><label htmlFor="st-avg">Minutes per order, per cook</label><input id="st-avg" className={`input ${errors.avgMinutesPerOrder ? 'input--error' : ''}`} value={form.avgMinutesPerOrder} onChange={set('avgMinutesPerOrder')} inputMode="numeric" />{err('avgMinutesPerOrder')}</div>
        </div>
        <div className="field"><label htmlFor="st-base">Walk-up orders already in the kitchen (baseline)</label><input id="st-base" className={`input ${errors.baseQueue ? 'input--error' : ''}`} value={form.baseQueue} onChange={set('baseQueue')} inputMode="numeric" />{err('baseQueue')}
          <p className="hint">Estimates are a simple formula: (orders waiting ÷ cooks) × minutes per order + the slowest item. They are not machine learning.</p></div>

        <button type="submit" className="btn btn-primary">Save settings</button>
        {saved && <div className="alert alert--ok" role="status">Settings saved.</div>}
      </form>

      <div className="demo-box section" style={{ maxWidth: 640 }}>
        <strong>Demo tools</strong>
        <p className="note">Restore the original sample menu, categories, staff and settings. Orders are not affected.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmReset(true)}>Reset catalog and settings</button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset catalog and settings?" message="This replaces your menu edits, categories, staff list and settings with the original sample data."
          confirmLabel="Reset"
          onConfirm={() => { resetCatalog(); setConfirmReset(false); setSaved(false); setForm({ collegeName: 'Demo College', canteenName: 'Main Canteen', opensAt: '08:00', closesAt: '17:00', cancel: 'placed', cooksOnDuty: '2', avgMinutesPerOrder: '4', baseQueue: '2' }); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
