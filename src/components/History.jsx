import { useState } from 'react';
import { Manager } from './Badge.jsx';
import { fmtEur, fmtFecha } from '../lib/format.js';
import { POSICIONES } from '../../shared/validate.js';

export default function History({ list, isAdmin, onDelete }) {
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const q = filter.trim().toLowerCase();
  const rows = [...list]
    .reverse()
    .filter((c) => !q || [c.jugador, c.club, c.comprador, c.vendedor].some((x) => String(x).toLowerCase().includes(q)));
  const visible = showAll || q ? rows : rows.slice(0, 10);

  return (
    <div className="history">
      <label className="field">
        <span>Buscar por jugador, club o mánager</span>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Ej: Brugué" />
      </label>

      {rows.length === 0 && <p className="empty">Ningún clausulazo coincide con esa búsqueda.</p>}

      <ol className="history-list">
        {visible.map((c) => (
          <li key={c.id} className="history-row">
            <div className="h-player">
              <span className={`pos-chip pos-${c.posicion || 'NA'}`} title={POSICIONES[c.posicion] || ''}>
                {c.posicion || '?'}
              </span>
              <div>
                <strong>{c.jugador}</strong>
                <small>{[c.club, fmtFecha(c.fecha, { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join(', ')}</small>
              </div>
            </div>
            <div className="h-route">
              <Manager name={c.vendedor} short />
              <span className="h-arrow" aria-label="pasa a">
                ➜
              </span>
              <Manager name={c.comprador} short />
            </div>
            <div className="h-amount">{fmtEur(c.importe)}</div>
            {isAdmin && (
              <button type="button" className="btn-ghost danger" onClick={() => onDelete(c)}>
                Borrar
              </button>
            )}
          </li>
        ))}
      </ol>

      {!q && rows.length > 10 && (
        <button type="button" className="btn-ghost" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Ver solo los 10 últimos' : `Ver los ${rows.length} clausulazos`}
        </button>
      )}
    </div>
  );
}
