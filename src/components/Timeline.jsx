import { fmtFecha, fmtEur } from '../lib/format.js';

export default function Timeline({ timeline }) {
  if (!timeline.length) return null;
  const max = Math.max(1, ...timeline.map((d) => d.count));
  return (
    <div className="timeline" role="list">
      {timeline.map((d) => (
        <div
          key={d.fecha}
          role="listitem"
          className={`tl-day ${d.count ? '' : 'empty'}`}
          title={`${fmtFecha(d.fecha, { day: 'numeric', month: 'long' })}: ${d.count} clausulazos${d.count ? `, ${fmtEur(d.total)}` : ''}`}
        >
          <span className="tl-count">{d.count || ''}</span>
          <span className="tl-bar" style={{ '--h': `${(d.count / max) * 100}%` }} />
          <span className="tl-date">{fmtFecha(d.fecha, { day: 'numeric' })}</span>
        </div>
      ))}
    </div>
  );
}
