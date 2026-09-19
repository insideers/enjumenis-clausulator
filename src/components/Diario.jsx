import { Badge } from './Badge.jsx';
import { fmtEur, fmtM, fmtFecha, haceCuanto } from '../lib/format.js';

function Nota({ nota }) {
  if (nota == null || !Number.isFinite(nota)) return null;
  const tono = nota >= 7 ? 'alta' : nota >= 5 ? 'media' : 'baja';
  return <span className={`nota nota-${tono}`}>{nota.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</span>;
}

export function principalesDe(c) {
  if (!c) return [];
  return c.principales?.length ? c.principales : [{ titular: c.titular, entradilla: c.entradilla, cuerpo: c.cuerpo }];
}

/** Cabecera del periódico, teletipo y artículos principales: lo primero que se ve. */
export function Portada({ cronica, cronicas, jornada, onJornada, stats }) {
  const principales = principalesDe(cronica);
  const u = stats.ultimo;

  return (
    <section className="portada">
      <div className="masthead">
        <div>
          <h1>El Diario de la Enjumenis</h1>
          <p className="masthead-sub">
            {cronica ? `Jornada ${cronica.jornada}` : 'Sin crónica publicada'}
            {cronica?.fecha ? ` · ${fmtFecha(cronica.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}
          </p>
        </div>
        {cronicas.length > 1 && (
          <div className="jornadas" role="tablist" aria-label="Jornadas">
            {[...cronicas].reverse().map((x) => (
              <button
                key={x.jornada}
                type="button"
                role="tab"
                aria-selected={x.jornada === jornada}
                onClick={() => onJornada(x.jornada)}
              >
                J{x.jornada}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ticker">
        <span className="ticker-label">Última hora</span>
        <ul>
          {u && (
            <li>
              <strong>{u.jugador}</strong> pasa de {u.vendedor} a {u.comprador} por {fmtEur(u.importe)}, {haceCuanto(u.fecha)}
            </li>
          )}
          <li>
            <strong>{stats.total}</strong> clausulazos y <strong>{fmtM(stats.dinero)}</strong> movidos esta temporada
          </li>
          {stats.rankings.hechos[0]?.hechos > 0 && (
            <li>
              <strong>{stats.rankings.hechos[0].name}</strong> manda en el mercado con {stats.rankings.hechos[0].hechos} cláusulas pagadas
            </li>
          )}
        </ul>
      </div>

      {principales.length > 0 ? (
        <div className={`diario-principales ${principales.length > 1 ? 'dos' : ''}`}>
          {principales.map((art, i) => (
            <article key={i} className="diario-main">
              <h2>{art.titular}</h2>
              {art.entradilla && <p className="diario-entradilla">{art.entradilla}</p>}
              {art.cuerpo?.map((par, j) => (
                <p key={j} className="diario-parrafo">
                  {par}
                </p>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <div className="diario-principales">
          <article className="diario-main">
            <h2>Todavía no hay crónica publicada</h2>
            <p className="diario-parrafo">
              En cuanto acabe la jornada, aquí va la portada: la crónica, el salseo, los vaticinios y el uno por uno. Mientras
              tanto, abajo tienes todo el destrozo del mercado.
            </p>
          </article>
        </div>
      )}
    </section>
  );
}

/** El resto de la crónica: piezas, vaticinios y uno por uno. */
export function DiarioResto({ cronica }) {
  if (!cronica) return null;
  return (
    <div className="diario">
      {cronica.piezas?.length > 0 && (
        <div className="news-grid piezas-grid">
          {cronica.piezas.map((p, i) => (
            <article key={i} className="news-card">
              {p.kicker && <p className="news-kicker">{p.kicker}</p>}
              <h3>{p.titular}</h3>
              <p className="news-body">{p.texto}</p>
            </article>
          ))}
        </div>
      )}

      {cronica.vaticinios?.length > 0 && (
        <section className="vaticinios">
          <h4>La bola de cristal</h4>
          <div className="vaticinios-list">
            {cronica.vaticinios.map((v, i) => (
              <div key={i}>
                {v.titular && <p className="vaticinio-titular">{v.titular}</p>}
                <p>{v.texto}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {cronica.unoPorUno?.length > 0 && (
        <section className="uno-por-uno">
          <h4>Uno por uno</h4>
          <ul>
            {cronica.unoPorUno.map((u) => (
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
