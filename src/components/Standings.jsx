import { Manager } from './Badge.jsx';

export default function Standings({ title, note, rows, valueKey, format, sub, tone = 'chalk', diverging = false }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r[valueKey])));
  return (
    <section className={`standings tone-${tone}`}>
      <header className="block-head">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </header>
      <ol className="standings-list">
        {rows.map((r, i) => {
          const v = r[valueKey];
          const pct = (Math.abs(v) / max) * 100;
          const zero = v === 0;
          return (
            <li key={r.name} className={zero ? 'is-zero' : ''}>
              <span className="pos">{zero ? '–' : i + 1}</span>
              <Manager name={r.name} />
              <span className={`bar ${diverging ? 'diverging' : ''}`}>
                <span
                  className={`bar-fill ${diverging && v < 0 ? 'neg' : ''}`}
                  style={{ '--w': `${diverging ? pct / 2 : pct}%` }}
                />
              </span>
              <span className="val">
                {format(v)}
                {sub && <small>{sub(r)}</small>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
