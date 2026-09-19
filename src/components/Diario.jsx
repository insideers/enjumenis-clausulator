import { useEffect, useState } from 'react';
import { Badge } from './Badge.jsx';
import { fmtFecha } from '../lib/format.js';

function Nota({ nota }) {
  if (nota == null || !Number.isFinite(nota)) return null;
  const tono = nota >= 7 ? 'alta' : nota >= 5 ? 'media' : 'baja';
  return <span className={`nota nota-${tono}`}>{nota.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</span>;
}

export default function Diario({ cronicas }) {
  const ultima = cronicas.length ? cronicas[cronicas.length - 1].jornada : null;
  const [jornada, setJornada] = useState(ultima);

  useEffect(() => setJornada(ultima), [ultima]);

  if (!cronicas.length) {
    return <p className="empty">Todavía no hay crónica publicada. En cuanto haya jornada, aquí aparece el periódico.</p>;
  }

  const c = cronicas.find((x) => x.jornada === jornada) || cronicas[cronicas.length - 1];

  return (
    <div className="diario">
      {cronicas.length > 1 && (
        <div className="jornadas" role="tablist" aria-label="Jornadas">
          {[...cronicas].reverse().map((x) => (
            <button
              key={x.jornada}
              type="button"
              role="tab"
              aria-selected={x.jornada === c.jornada}
              onClick={() => setJornada(x.jornada)}
            >
              J{x.jornada}
            </button>
          ))}
        </div>
      )}

      <article className="diario-main">
        <p className="diario-kicker">
          Jornada {c.jornada}
          {c.fecha ? ` · ${fmtFecha(c.fecha, { day: 'numeric', month: 'long' })}` : ''}
        </p>
        <h3>{c.titular}</h3>
        {c.entradilla && <p className="diario-entradilla">{c.entradilla}</p>}
        {c.cuerpo?.map((p, i) => (
          <p key={i} className="diario-parrafo">
            {p}
          </p>
        ))}
      </article>

      {c.piezas?.length > 0 && (
        <div className="news-grid piezas-grid">
          {c.piezas.map((p, i) => (
            <article key={i} className="news-card">
              {p.kicker && <p className="news-kicker">{p.kicker}</p>}
              <h3>{p.titular}</h3>
              <p className="news-body">{p.texto}</p>
            </article>
          ))}
        </div>
      )}

      {c.vaticinios?.length > 0 && (
        <section className="vaticinios">
          <h4>La bola de cristal</h4>
          <div className="vaticinios-list">
            {c.vaticinios.map((v, i) => (
              <div key={i}>
                {v.titular && <p className="vaticinio-titular">{v.titular}</p>}
                <p>{v.texto}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {c.unoPorUno?.length > 0 && (
        <section className="uno-por-uno">
          <h4>Uno por uno</h4>
          <ul>
            {c.unoPorUno.map((u) => (
              <li key={u.manager}>
                <Badge name={u.manager} size="md" />
                <div>
                  <strong>{u.manager}</strong>
                  <p>{u.texto}</p>
                </div>
                <Nota nota={u.nota} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
