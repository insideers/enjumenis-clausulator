import { Manager } from './Badge.jsx';
import { AWARDS, EMPTY_LINES } from '../lib/copy.js';
import { fmtEur, fmtFecha } from '../lib/format.js';

function RefCard({ tone, title, children }) {
  return (
    <article className={`ref-card ref-${tone}`}>
      <h4>{title}</h4>
      {children}
    </article>
  );
}

function Winners({ rows }) {
  return (
    <div className="winners">
      {rows.map((r) => (
        <Manager key={r.name} name={r.name} size="md" />
      ))}
    </div>
  );
}

export default function Awards({ stats }) {
  const { awards, masCaro, masBarato, masRobados, derbi, idaYVuelta, vendettas, diaCaliente } = stats;
  const otrasVendettas = vendettas.filter((v) => !derbi || v.a !== derbi.a || v.b !== derbi.b);
  const order = ['pichichi', 'coladero', 'florentino', 'hucha', 'farolillo', 'jeque', 'gangas'];

  return (
    <div className="awards-grid">
      {order.map((key) => {
        const a = awards[key];
        const def = AWARDS[key];
        if (!a.rows.length) return null;
        return (
          <RefCard key={key} tone={def.card} title={def.title}>
            <Winners rows={a.rows} />
            <p className="ref-stat">{def.stat(a.value)}</p>
            <p className="ref-line">{def.line}</p>
          </RefCard>
        );
      })}

      {masCaro && (
        <RefCard tone="red" title="Atraco del año">
          <p className="ref-big">{masCaro.jugador}</p>
          <p className="ref-stat">{fmtEur(masCaro.importe)}</p>
          <p className="ref-line">
            {masCaro.comprador} vació la cuenta para llevárselo de {masCaro.vendedor}. Aún hay eco en esa caja fuerte.
          </p>
        </RefCard>
      )}

      {masBarato && (
        <RefCard tone="yellow" title="Ganga de saldo">
          <p className="ref-big">{masBarato.jugador}</p>
          <p className="ref-stat">{fmtEur(masBarato.importe)}</p>
          <p className="ref-line">
            {masBarato.vendedor} tenía la cláusula al precio de un bocata. {masBarato.comprador} no se lo pensó.
          </p>
        </RefCard>
      )}

      {masRobados.length > 0 && (
        <RefCard tone="yellow" title="Balón más manoseado">
          {masRobados.map((p) => (
            <div key={p.jugador} className="manoseado">
              <p className="ref-big">{p.jugador}</p>
              <p className="ref-stat">
                Robado {p.count} veces: {p.movimientos.map((m) => m.vendedor).concat(p.movimientos.at(-1).comprador).join(' ➜ ')}
              </p>
            </div>
          ))}
          <p className="ref-line">Tienen más camisetas de la Enjumenis que maletas. Ya ni deshacen el equipaje.</p>
        </RefCard>
      )}

      {derbi && (
        <RefCard tone="red" title="Derbi del rencor">
          <div className="derbi">
            <Manager name={derbi.a} size="md" />
            <span className="derbi-score">
              {derbi.ab} – {derbi.ba}
            </span>
            <Manager name={derbi.b} size="md" />
          </div>
          <p className="ref-stat">
            {derbi.ab + derbi.ba} clausulazos entre ellos, {fmtEur(derbi.total)}
          </p>
          <p className="ref-line">Esto ya no es mercado, es algo personal. Que alguien llame a Mediación.</p>
        </RefCard>
      )}

      {idaYVuelta.length > 0 && (
        <RefCard tone="red" title="Ida y vuelta">
          {idaYVuelta.slice(0, 2).map((x) => (
            <div key={x.ida.id + x.vuelta.id} className="ida-vuelta">
              <p className="ref-big">{x.jugador}</p>
              <p className="ref-stat">
                {fmtEur(x.ida.importe)} para irse, {fmtEur(x.vuelta.importe)} para volver
              </p>
              <p className="ref-line">
                {x.ida.comprador} se lo quitó a {x.ida.vendedor} el {fmtFecha(x.ida.fecha)} y {x.vuelta.comprador} lo
                recuperó el {fmtFecha(x.vuelta.fecha)}. La historia se repite y cada vez sale más cara.
              </p>
            </div>
          ))}
        </RefCard>
      )}

      {otrasVendettas.length > 0 && (
        <RefCard tone="yellow" title="Ojo por ojo">
          <ul className="vendettas">
            {otrasVendettas.map((v) => (
              <li key={v.a + v.b}>
                <strong>{v.a}</strong> {v.ab} – {v.ba} <strong>{v.b}</strong>
              </li>
            ))}
          </ul>
          <p className="ref-line">Parejas que se han robado mutuamente. Aquí nadie pone la otra mejilla.</p>
        </RefCard>
      )}

      {diaCaliente && diaCaliente.count > 1 && (
        <RefCard tone="yellow" title="Noche de cuchillos largos">
          <p className="ref-big">{fmtFecha(diaCaliente.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="ref-stat">
            {diaCaliente.count} clausulazos en un día, {fmtEur(diaCaliente.total)}
          </p>
          <p className="ref-line">Ese día convenía dormir con el móvil debajo de la almohada.</p>
        </RefCard>
      )}

      {[
        ['candado', 'El Candado'],
        ['cholo', 'El Cholo'],
        ['fantasmas', 'Desaparecidos en combate'],
      ].map(([key, title]) =>
        awards[key].length ? (
          <RefCard key={key} tone="white" title={title}>
            <Winners rows={awards[key]} />
            <p className="ref-line">{EMPTY_LINES[key]}</p>
          </RefCard>
        ) : null
      )}
    </div>
  );
}
