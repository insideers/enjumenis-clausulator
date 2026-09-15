import { managerInfo } from '../../shared/managers.js';
import { Badge } from './Badge.jsx';

export default function Matrix({ stats }) {
  const names = stats.names.filter((n) => stats.managers.find((m) => m.name === n)?.implicado > 0);
  if (!names.length) return null;
  const max = Math.max(1, ...names.flatMap((a) => names.map((b) => stats.matrix[a][b])));

  return (
    <div className="matrix-wrap" tabIndex={0} aria-label="Tabla de quién ha hecho clausulazos a quién">
      <table className="matrix">
        <thead>
          <tr>
            <th className="corner" scope="col">
              <span>Víctima</span>
              <span>Verdugo</span>
            </th>
            {names.map((n) => (
              <th key={n} scope="col" title={n}>
                <Badge name={n} size="sm" />
                <span className="col-name">{managerInfo(n).short}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {names.map((buyer) => (
            <tr key={buyer}>
              <th scope="row" title={buyer}>
                <Badge name={buyer} size="sm" />
                <span>{managerInfo(buyer).short}</span>
              </th>
              {names.map((victim) => {
                const v = stats.matrix[buyer][victim];
                return (
                  <td
                    key={victim}
                    className={buyer === victim ? 'self' : v ? 'hit' : ''}
                    style={v ? { '--heat': 0.25 + (0.75 * v) / max } : undefined}
                    title={v ? `${buyer} → ${victim}: ${v}` : undefined}
                  >
                    {buyer === victim ? '' : v || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
