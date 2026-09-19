import { useState } from 'react';
import { managerProfile } from '../lib/stats.js';
import { verdict } from '../lib/copy.js';
import { fmtM, fmtSignedM, fmtEur, fmtFecha } from '../lib/format.js';
import { Badge } from './Badge.jsx';

export default function Profile({ stats }) {
  const [name, setName] = useState(stats.rankings.recibidos[0]?.name || stats.names[0]);
  const p = managerProfile(stats, name);
  if (!p) return null;

  return (
    <div className="profile">
      <label className="field profile-select">
        <span>Elige a quién retratar</span>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {stats.names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <div className="profile-card">
        <div className="profile-id">
          <Badge name={p.name} size="xl" />
          <div>
            <h3>{p.name}</h3>
            <p className="verdict">{verdict(p)}</p>
          </div>
        </div>

        <dl className="profile-stats">
          <div>
            <dt>Hechos</dt>
            <dd>{p.hechos}</dd>
          </div>
          <div>
            <dt>Recibidos</dt>
            <dd>{p.recibidos}</dd>
          </div>
          <div>
            <dt>Gastado</dt>
            <dd>{fmtM(p.gastado)}</dd>
          </div>
          <div>
            <dt>Cobrado</dt>
            <dd>{fmtM(p.cobrado)}</dd>
          </div>
          <div>
            <dt>Balance</dt>
            <dd className={p.balance < 0 ? 'neg' : p.balance > 0 ? 'pos' : ''}>{fmtSignedM(p.balance)}</dd>
          </div>
        </dl>

        <div className="profile-rel">
          <p>
            <span>Su verdugo</span>
            {p.verdugo ? `${p.verdugo.name} (${p.verdugo.count})` : 'Nadie. Todavía.'}
          </p>
          <p>
            <span>Su víctima favorita</span>
            {p.victima ? `${p.victima.name} (${p.victima.count})` : 'No ha roto un plato.'}
          </p>
        </div>

        {p.movimientos.length > 0 && (
          <ul className="profile-moves">
            {p.movimientos.map((c) => {
              const robo = c.comprador === p.name;
              return (
                <li key={c.id} className={robo ? 'robo' : 'robado'}>
                  <span className="move-tag">{robo ? 'Roba' : 'Le roban'}</span>
                  <span className="move-player">{c.jugador}</span>
                  <span className="move-who">
                    {robo ? `a ${c.vendedor}` : `por ${c.comprador}`}
                  </span>
                  <span className="move-amount">{fmtEur(c.importe)}</span>
                  <span className="move-date">{fmtFecha(c.fecha)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
