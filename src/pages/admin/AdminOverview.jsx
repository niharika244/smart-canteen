import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { getReportOrders, summarize } from '../../services/reportService';
import { formatDayKey, toDateKey } from '../../utils/time';
import { isActive } from '../../utils/orderStatus';
import { formatPrice } from '../../utils/format';
import BarChart from '../../components/BarChart';

export default function AdminOverview() {
  const { orders, menu, college } = useApp();
  const [todayKey] = useState(() => toDateKey(new Date()));
  const [weekStart] = useState(() => toDateKey(Date.now() - 6 * 86400000));

  const todays = summarize(orders.filter((o) => toDateKey(o.createdAt) === todayKey), todayKey, todayKey);
  const week = summarize(getReportOrders(orders, weekStart, todayKey), weekStart, todayKey);
  const activeCount = orders.filter(isActive).length;
  const unavailable = menu.filter((i) => !i.available).length;

  return (
    <div>
      <header className="page-head">
        <h1>Overview</h1>
        <p>{college.name} · {college.canteen} · open {college.hours}</p>
      </header>

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat"><span>Orders today</span><strong>{todays.orderCount}</strong></div>
        <div className="stat"><span>Sales today</span><strong>{formatPrice(todays.sales)}</strong></div>
        <div className="stat"><span>Active orders</span><strong>{activeCount}</strong><Link to="/kitchen" className="link">Open kitchen</Link></div>
        <div className="stat"><span>Unavailable items</span><strong>{unavailable}</strong><Link to="/admin/menu" className="link">Manage menu</Link></div>
      </div>
      <p className="note" style={{ marginTop: 8 }}>Today's numbers come from orders placed in this browser.</p>

      <div className="two-col">
        <section className="panel">
          <h2>Orders, last 7 days</h2>
          <BarChart
            data={week.byDay.map((d) => ({ label: formatDayKey(d.key), value: d.orders }))}
            ariaLabel={`Orders per day: ${week.byDay.map((d) => `${formatDayKey(d.key)} ${d.orders}`).join(', ')}`}
          />
          <p className="note">Includes generated sample history, not real business data.</p>
        </section>

        <section className="panel">
          <h2>Popular items, last 7 days</h2>
          <ol className="rank-list">
            {week.topItems.slice(0, 5).map((i) => <li key={i.itemId}><span>{i.name}</span><strong>{i.units}</strong></li>)}
          </ol>
          <p className="note">Units sold. Sample history included.</p>
          <Link to="/admin/reports" className="link">Open full reports</Link>
        </section>
      </div>
    </div>
  );
}
