import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { demandByHour, getReportOrders, summarize } from '../../services/reportService';
import { downloadCsv } from '../../utils/csv';
import { formatDateTime, formatDayKey, toDateKey } from '../../utils/time';
import { formatPrice } from '../../utils/format';
import BarChart from '../../components/BarChart';
import StatusBadge from '../../components/StatusBadge';

const hourLabel = (h) => (h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`);
const MAX_DAYS = 62;

export default function AdminReports() {
  const { orders, menu } = useApp();
  const [to, setTo] = useState(() => toDateKey(new Date()));
  const [from, setFrom] = useState(() => toDateKey(Date.now() - 6 * 86400000));
  const [hourItem, setHourItem] = useState('');

  const days = from && to ? Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000) + 1 : 0;
  const rangeError = !from || !to ? 'Choose both dates.' : days < 1 ? 'The start date must be on or before the end date.' : days > MAX_DAYS ? `Choose a range of ${MAX_DAYS} days or less.` : '';

  const rangeOrders = useMemo(() => (rangeError ? [] : getReportOrders(orders, from, to)), [orders, from, to, rangeError]);
  const summary = useMemo(() => (rangeError ? null : summarize(rangeOrders, from, to)), [rangeOrders, from, to, rangeError]);
  const hourBars = useMemo(
    () => (summary ? demandByHour(summary.valid, hourItem || null).map((b) => ({ label: hourLabel(b.hour), value: b.value })) : []),
    [summary, hourItem]
  );

  // Waste-reduction insights, based on the selected range.
  const insights = useMemo(() => {
    if (!summary) return null;
    const unitsById = new Map(summary.topItems.map((t) => [t.itemId, t.units]));
    const demand = menu.map((item) => ({ item, units: unitsById.get(item.id) ?? 0 }));
    const avg = demand.length ? demand.reduce((s, d) => s + d.units, 0) / demand.length : 0;
    const threshold = Math.max(1, Math.floor(avg * 0.4));
    return {
      slow: demand.filter((d) => d.item.available && d.units <= threshold).sort((a, b) => a.units - b.units).slice(0, 5),
      popularUnavailable: demand.filter((d) => !d.item.available && d.units >= avg).sort((a, b) => b.units - a.units),
      limited: menu.filter((i) => i.dailyLimit),
    };
  }, [summary, menu]);

  function exportDaily() {
    downloadCsv(`smart-canteen-daily-${from}-to-${to}.csv`, [
      ['Date', 'Orders', 'Sales (INR)'],
      ...summary.byDay.map((d) => [d.key, d.orders, d.sales]),
    ]);
  }
  function exportOrders() {
    downloadCsv(`smart-canteen-orders-${from}-to-${to}.csv`, [
      ['Order', 'Date and time', 'Status', 'Items', 'Total (INR)', 'Source'],
      ...rangeOrders.map((o) => [o.number, formatDateTime(o.createdAt), o.status, o.items.map((i) => `${i.qty} x ${i.name}`).join('; '), o.total, o.sample ? 'sample' : 'this browser']),
    ]);
  }

  return (
    <div>
      <header className="page-head">
        <h1>Reports</h1>
        <p>Orders from this browser plus generated sample history. Not real business statistics.</p>
      </header>

      <div className="filters filters--simple">
        <div className="field"><label htmlFor="r-from">From</label><input id="r-from" type="date" className="input" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="field"><label htmlFor="r-to">To</label><input id="r-to" type="date" className="input" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      {rangeError && <p className="field-error" role="alert">{rangeError}</p>}

      {summary && (
        <>
          <div className="stat-grid">
            <div className="stat"><span>Orders</span><strong>{summary.orderCount}</strong></div>
            <div className="stat"><span>Sales</span><strong>{formatPrice(summary.sales)}</strong></div>
            <div className="stat"><span>Average order</span><strong>{formatPrice(summary.avgOrder)}</strong></div>
            <div className="stat"><span>Days</span><strong>{days}</strong></div>
          </div>

          <div className="btn-row btn-row--left" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportDaily}><Download size={16} aria-hidden="true" /> Export daily summary (CSV)</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportOrders}><Download size={16} aria-hidden="true" /> Export orders (CSV)</button>
          </div>

          <div className="two-col">
            <section className="panel">
              <h2>Orders per day</h2>
              {summary.byDay.length > 21 ? (
                <p className="note">Range is long, so the chart is hidden. Use the CSV export for daily numbers.</p>
              ) : (
                <BarChart data={summary.byDay.map((d) => ({ label: formatDayKey(d.key), value: d.orders }))} ariaLabel={`Orders per day: ${summary.byDay.map((d) => `${formatDayKey(d.key)} ${d.orders}`).join(', ')}`} />
              )}
            </section>
            <section className="panel">
              <h2>Popular items</h2>
              {summary.topItems.length === 0 ? <p className="note">No orders in this range.</p> : (
                <ol className="rank-list">
                  {summary.topItems.slice(0, 8).map((i) => <li key={i.itemId}><span>{i.name}</span><span>{i.units} sold · {formatPrice(i.revenue)}</span></li>)}
                </ol>
              )}
            </section>
          </div>

          <section className="panel section">
            <h2>Demand by time of day</h2>
            <div className="field" style={{ maxWidth: 320 }}>
              <label htmlFor="r-item">Show</label>
              <select id="r-item" className="input" value={hourItem} onChange={(e) => setHourItem(e.target.value)}>
                <option value="">All orders</option>
                {menu.map((i) => <option key={i.id} value={i.id}>{i.name} (units)</option>)}
              </select>
            </div>
            <BarChart data={hourBars} ariaLabel={`Demand by hour: ${hourBars.map((b) => `${b.label} ${b.value}`).join(', ')}`} />
          </section>

          <section className="panel section">
            <h2>Waste reduction</h2>
            <p className="note">Based on the selected range and sample data. Use as a prompt for review, not as a forecast.</p>
            <h3>Selling slowly (available items)</h3>
            {insights.slow.length === 0 ? <p className="note">Nothing stands out in this range.</p> : (
              <ul className="items-list">{insights.slow.map((d) => <li key={d.item.id}><span>{d.item.name}</span><span>{d.units} sold</span></li>)}</ul>
            )}
            <h3>Popular but currently unavailable</h3>
            {insights.popularUnavailable.length === 0 ? <p className="note">No popular item is unavailable.</p> : (
              <ul className="items-list">{insights.popularUnavailable.map((d) => <li key={d.item.id}><span>{d.item.name}</span><span className="warn">Needs an availability update ({d.units} sold)</span></li>)}</ul>
            )}
            <h3>Limited-quantity items</h3>
            {insights.limited.length === 0 ? <p className="note">None marked. Mark items as limited when editing them in Menu.</p> : (
              <ul className="items-list">{insights.limited.map((i) => <li key={i.id}><span>{i.name}</span><span>{i.dailyLimit} per day</span></li>)}</ul>
            )}
          </section>

          <section className="section">
            <h2>Order history</h2>
            {rangeOrders.length === 0 ? <p className="note">No orders in this range.</p> : (
              <>
                <div className="table-wrap">
                  <table className="resp-table">
                    <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Source</th></tr></thead>
                    <tbody>
                      {rangeOrders.slice(0, 25).map((o) => (
                        <tr key={o.id}>
                          <td data-label="Order"><strong>{o.number}</strong></td>
                          <td data-label="Date">{formatDateTime(o.createdAt)}</td>
                          <td data-label="Items">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</td>
                          <td data-label="Total">{formatPrice(o.total)}</td>
                          <td data-label="Status"><StatusBadge status={o.status} /></td>
                          <td data-label="Source">{o.sample ? 'Sample' : 'This browser'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="note">Showing the latest {Math.min(25, rangeOrders.length)} of {rangeOrders.length}. Export for the full list.</p>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
