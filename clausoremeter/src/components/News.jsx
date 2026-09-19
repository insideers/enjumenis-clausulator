import { fmtFecha } from '../lib/format.js';

export default function News({ news }) {
  if (!news.items.length) {
    return <p className="empty">Semana tranquila: nadie ha pagado una cláusula. Sospechoso.</p>;
  }
  return (
    <div className="news-grid">
      {news.items.map((n) => (
        <article key={n.id} className="news-card">
          <p className="news-kicker">{n.kicker}</p>
          <h3>{n.titular}</h3>
          <p className="news-body">{n.cuerpo}</p>
          <p className="news-date">{fmtFecha(n.fecha, { day: 'numeric', month: 'long' })}</p>
        </article>
      ))}
    </div>
  );
}
