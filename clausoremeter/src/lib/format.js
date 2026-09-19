const nf = new Intl.NumberFormat('es-ES', { useGrouping: true });

export function fmtEur(v) {
  // es-ES no agrupa números de 4 cifras; forzamos el punto siempre
  return `${String(Math.round(v || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
}

export function fmtM(v, digits = 1) {
  const n = (v || 0) / 1e6;
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits })} M€`;
}

export function fmtSignedM(v) {
  const s = fmtM(Math.abs(v));
  if (Math.round(v / 1e5) === 0) return s;
  return v > 0 ? `+${s}` : `−${s}`;
}

export function fmtFecha(fecha, opts = { day: 'numeric', month: 'short' }) {
  if (!fecha) return '';
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', opts);
}

export function haceCuanto(fecha) {
  if (!fecha) return '';
  const today = new Date();
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = fecha.split('-').map(Number);
  const days = Math.round((t - Date.UTC(y, m - 1, d)) / 86400000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
}

export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export { nf };
