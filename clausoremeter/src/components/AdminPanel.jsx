import { useEffect, useRef, useState } from 'react';
import { MANAGER_NAMES } from '../../shared/managers.js';
import { POSICIONES, normalizeClausulazo, parseImporte } from '../../shared/validate.js';
import { addClausulazo, checkPassword, importClausulazos } from '../lib/api.js';
import { fmtEur, todayISO } from '../lib/format.js';

const EMPTY = { jugador: '', club: '', posicion: '', comprador: '', vendedor: '', importe: '', fecha: '' };

export default function AdminPanel({ open, onClose, password, onLogin, onLogout, online, list, onData }) {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState('nuevo');
  const [pw, setPw] = useState('');
  const [form, setForm] = useState({ ...EMPTY, fecha: todayISO() });
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (open) setMsg(null);
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const preview = parseImporte(form.importe);

  async function run(fn, success) {
    setBusy(true);
    setMsg(null);
    try {
      const result = await fn();
      if (Array.isArray(result)) onData(result);
      setMsg({ type: 'ok', text: success });
      return true;
    } catch (err) {
      if (err.status === 401) onLogout();
      setMsg({ type: 'error', text: err.message });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const ok = await run(() => checkPassword(pw), 'Dentro. Ya puedes apuntar clausulazos.');
    if (ok) {
      onLogin(pw);
      setPw('');
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const { errors } = normalizeClausulazo(form);
    if (errors.length) {
      setMsg({ type: 'error', text: errors.join(' ') });
      return;
    }
    const ok = await run(
      () => addClausulazo(password, form),
      `Clausulazo apuntado: ${form.jugador} de ${form.vendedor} a ${form.comprador}.`
    );
    if (ok) setForm({ ...EMPTY, fecha: form.fecha });
  }

  async function handleImport(mode) {
    let items;
    try {
      items = JSON.parse(importText);
    } catch {
      setMsg({ type: 'error', text: 'Ese texto no es un JSON válido. Revisa comas y corchetes.' });
      return;
    }
    if (mode === 'replace' && !window.confirm('Esto borra todos los clausulazos actuales y deja solo los importados. ¿Seguro?')) {
      return;
    }
    const ok = await run(
      () => importClausulazos(password, items, mode),
      mode === 'replace' ? 'Historial reemplazado.' : 'Clausulazos importados.'
    );
    if (ok) setImportText('');
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clausulazos-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <dialog ref={dialogRef} className="admin" onClose={onClose} onCancel={onClose}>
      <div className="admin-head">
        <h2>Zona del delegado</h2>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {!online && (
        <p className="notice error">
          No hay conexión con la base de datos, así que no se puede guardar nada. Revisa el README para conectar Upstash
          Redis en Vercel.
        </p>
      )}

      {!password ? (
        <form className="admin-body" onSubmit={handleLogin}>
          <p>Para apuntar, borrar o importar clausulazos necesitas la contraseña de la liga.</p>
          <label className="field">
            <span>Contraseña</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
          </label>
          <button className="btn-primary" disabled={busy || !online}>
            {busy ? 'Comprobando…' : 'Entrar'}
          </button>
        </form>
      ) : (
        <div className="admin-body">
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'nuevo'} onClick={() => setTab('nuevo')}>
              Apuntar clausulazo
            </button>
            <button type="button" role="tab" aria-selected={tab === 'datos'} onClick={() => setTab('datos')}>
              Importar y exportar
            </button>
          </div>

          {tab === 'nuevo' ? (
            <form className="admin-form" onSubmit={handleAdd}>
              <label className="field span-2">
                <span>Jugador</span>
                <input value={form.jugador} onChange={set('jugador')} placeholder="Ej: Marc Roca" required />
              </label>
              <label className="field">
                <span>Club</span>
                <input value={form.club} onChange={set('club')} placeholder="Opcional" />
              </label>
              <label className="field">
                <span>Posición</span>
                <select value={form.posicion} onChange={set('posicion')}>
                  <option value="">Sin especificar</option>
                  {Object.entries(POSICIONES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Víctima (de quién sale)</span>
                <select value={form.vendedor} onChange={set('vendedor')} required>
                  <option value="">Elige mánager</option>
                  {MANAGER_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Verdugo (quién paga)</span>
                <select value={form.comprador} onChange={set('comprador')} required>
                  <option value="">Elige mánager</option>
                  {MANAGER_NAMES.filter((n) => n !== form.vendedor).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Importe</span>
                <input value={form.importe} onChange={set('importe')} placeholder="2.115.000 o 2,1M" inputMode="decimal" required />
                <small>{preview ? fmtEur(preview) : 'Acepta 2.115.000, 2115000 o 2,1M'}</small>
              </label>
              <label className="field">
                <span>Fecha</span>
                <input type="date" value={form.fecha} onChange={set('fecha')} required />
              </label>
              <button className="btn-primary span-2" disabled={busy || !online}>
                {busy ? 'Guardando…' : 'Apuntar clausulazo'}
              </button>
            </form>
          ) : (
            <div className="admin-data">
              <p>
                Pega una lista en JSON con el mismo formato que la exportación. Cada clausulazo necesita{' '}
                <code>jugador</code>, <code>comprador</code>, <code>vendedor</code>, <code>importe</code> y{' '}
                <code>fecha</code> (AAAA-MM-DD).
              </p>
              <label className="field">
                <span>JSON</span>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={8} spellCheck={false} />
              </label>
              <div className="admin-actions">
                <button type="button" className="btn-primary" disabled={busy || !importText || !online} onClick={() => handleImport('merge')}>
                  Añadir al historial
                </button>
                <button type="button" className="btn-ghost danger" disabled={busy || !importText || !online} onClick={() => handleImport('replace')}>
                  Reemplazar todo
                </button>
                <button type="button" className="btn-ghost" onClick={handleExport}>
                  Descargar copia ({list.length})
                </button>
              </div>
            </div>
          )}

          <button type="button" className="btn-link" onClick={onLogout}>
            Cerrar sesión de delegado
          </button>
        </div>
      )}

      {msg && (
        <p className={`notice ${msg.type}`} role="status">
          {msg.text}
        </p>
      )}
    </dialog>
  );
}
