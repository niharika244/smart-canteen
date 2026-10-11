// Simple CSS bar chart (no chart library). The aria-label summarises the data for screen readers.
export default function BarChart({ data, ariaLabel, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div className="bar-col" key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <div className="bar-area">
            <span className="bar-val">{d.value > 0 ? format(d.value) : ''}</span>
            <div className="bar" style={{ height: `calc((100% - 18px) * ${d.value / max})` }} />
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
