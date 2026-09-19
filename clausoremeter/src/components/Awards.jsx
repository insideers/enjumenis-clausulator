import { Manager } from './Badge.jsx';
import { AWARDS, EMPTY_LINES } from '../lib/copy.js';
import { fmtEur } from '../lib/format.js';

function RefCard({ tone, title, children }) {
  return (
    <article className={`ref-card ref-${tone}`}>
      <h4>{title}</h4>
      {children}
    </article>
  );
}

const Winners = ({ rows }) => (
  <div className="winners">
    {rows.map((r) => (
      <Manager key={r.name} name={r.name} size="md" />
    ))}
  </div>
);

const nombres = (rows) => rows.map((r) => r.name).join(', ');

export default function Awards({ stats }) {
  const { awards, masCaro, masBarato, masRobados, derbi, idaYVuelta } = stats;

  // Se muestran las seis primeras que tengan ganador
  const candidatas = [
    ...['pichichi', 'coladero', 'florentino', 'hucha'].map((key) => ({
      key,
      when: awards[key].rows.length > 0,
      node: (
        <RefCard tone={AWARDS[key].card} title={AWARDS[key].title}>
          <Winners rows={awards[key].rows} />
          <p className="ref-stat">{AWARDS[key].stat(awards[key].value)}</p>
          <p className="ref-line">{AWARDS[key].line}</p>
        </RefCard>
      ),
    })),
    {
      key: 'atraco',
      when: Boolean(masCaro),
      node: masCaro && (
        <RefCard tone="red" title="Atraco del año">
          <p className="ref-big">{masCaro.jugador}</p>
          <p className="ref-stat">{fmtEur(masCaro.importe)}</p>
          <p className="ref-line">
            {masCaro.comprador} vació la cuenta para llevárselo de {masCaro.vendedor}. Aún hay eco en esa caja fuerte.
          </p>
        </RefCard>
      ),
    },
    ...['farolillo', 'jeque', 'gangas'].map((key) => ({
      key,
      when: awards[key].rows.length > 0,
      node: (
        <RefCard tone={AWARDS[key].card} title={AWARDS[key].title}>
          <Winners rows={awards[key].rows} />
          <p className="ref-stat">{AWARDS[key].stat(awards[key].value)}</p>
          <p className="ref-line">{AWARDS[key].line}</p>
        </RefCard>
      ),
    })),
    {
      key: 'ganga',
      when: Boolean(masBarato) && masBarato?.id !== masCaro?.id,
      node: masBarato && (
        <RefCard tone="yellow" title="Ganga de saldo">
          <p className="ref-big">{masBarato.jugador}</p>
          <p className="ref-stat">{fmtEur(masBarato.importe)}</p>
          <p className="ref-line">
            {masBarato.vendedor} tenía la cláusula al precio de un bocata. {masBarato.comprador} no se lo pensó.
          </p>
        </RefCard>
      ),
    },
  ].filter((c) => c.when);

  // Lo que no cabe en las seis tarjetas se resume en una línea
  const menciones = [];
  if (derbi) {
    menciones.push(
      `Derbi del rencor: ${derbi.a} ${derbi.ab} – ${derbi.ba} ${derbi.b}, ${derbi.ab + derbi.ba} clausulazos entre ellos.`
    );
  }
  if (masRobados.length) {
    menciones.push(
      `Balón más manoseado: ${masRobados.map((p) => p.jugador).join(', ')}, con ${masRobados[0].count} mudanzas cada uno.`
    );
  }
  if (idaYVuelta.length) {
    menciones.push(
      `Han vuelto a casa: ${[...new Set(idaYVuelta.map((x) => x.jugador))].join(', ')}. La historia se repite y cada vez sale más cara.`
    );
  }
  if (awards.candado.length) menciones.push(`El Candado: ${nombres(awards.candado)}. ${EMPTY_LINES.candado}`);
  if (awards.cholo.length) menciones.push(`El Cholo: ${nombres(awards.cholo)}. ${EMPTY_LINES.cholo}`);
  if (awards.fantasmas.length) menciones.push(`Desaparecidos en combate: ${nombres(awards.fantasmas)}. ${EMPTY_LINES.fantasmas}`);

  return (
    <>
      <div className="awards-grid">
        {candidatas.slice(0, 6).map((c) => (
          <div key={c.key} className="award-slot">
            {c.node}
          </div>
        ))}
      </div>
      {menciones.length > 0 && (
        <div className="menciones">
          <h3>Además</h3>
          <ul>
            {menciones.slice(0, 4).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
