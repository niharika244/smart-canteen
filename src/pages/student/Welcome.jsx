import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { DEMO_COLLEGES } from '../../data/college';
import FoodGridSkeleton from '../../components/FoodGridSkeleton';

export default function Welcome() {
  const { settings, loading, completeWelcome } = useApp();
  if (loading) return <div className="welcome"><div className="welcome-card"><FoodGridSkeleton count={1} /></div></div>;
  return <WelcomeForm settings={settings} onDone={completeWelcome} />;
}

function WelcomeForm({ settings, onDone }) {
  const navigate = useNavigate();
  const initial = DEMO_COLLEGES.find((c) => c.id === settings.collegeId) || DEMO_COLLEGES[0];
  const [collegeId, setCollegeId] = useState(initial.id);
  const college = DEMO_COLLEGES.find((c) => c.id === collegeId);
  const [canteen, setCanteen] = useState(initial.canteens.includes(settings.canteenName) ? settings.canteenName : initial.canteens[0]);

  function changeCollege(e) {
    const next = DEMO_COLLEGES.find((c) => c.id === e.target.value);
    setCollegeId(next.id);
    setCanteen(next.canteens[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onDone(college.id, college.name, canteen);
    navigate('/');
  }

  return (
    <div className="welcome">
      <form className="welcome-card" onSubmit={handleSubmit}>
        <div className="brand"><Leaf size={26} aria-hidden="true" /><span>Smart Canteen</span></div>
        <h1>Order ahead. Skip the queue.</h1>
        <p>Choose your college and canteen to see today's menu.</p>

        <div className="field">
          <label htmlFor="w-college">College</label>
          <select id="w-college" className="input" value={collegeId} onChange={changeCollege}>
            {DEMO_COLLEGES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="w-canteen">Canteen</label>
          <select id="w-canteen" className="input" value={canteen} onChange={(e) => setCanteen(e.target.value)}>
            {college.canteens.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-lg">Continue as student</button>
        <p className="note">These are fictional demo colleges and share one sample menu. In the real product each college has its own menu and data, kept separate by the backend.</p>

        <div className="demo-box" style={{ justifyItems: 'stretch' }}>
          <strong>Demo access for staff (no sign-in in this prototype)</strong>
          <div className="btn-row btn-row--left">
            <Link to="/kitchen" className="btn btn-secondary btn-sm">Kitchen dashboard</Link>
            <Link to="/admin" className="btn btn-secondary btn-sm">Admin dashboard</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
