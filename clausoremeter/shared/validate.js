export const POSICIONES = {
  PT: 'Portero',
  DF: 'Defensa',
  MC: 'Centrocampista',
  DL: 'Delantero',
};

const clean = (v, max = 80) => String(v ?? '').trim().slice(0, max);

function makeId() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Acepta "2.115.000", "2115000", "2,1M", "850k", "3.5 M€"...
export function parseImporte(input) {
  if (typeof input === 'number') return Number.isFinite(input) && input > 0 ? Math.round(input) : null;
  let s = String(input ?? '').trim().toLowerCase().replace(/[\s€]/g, '');
  if (!s) return null;
  let mult = 1;
  if (s.endsWith('m')) {
    mult = 1e6;
    s = s.slice(0, -1);
  } else if (s.endsWith('k')) {
    mult = 1e3;
    s = s.slice(0, -1);
  }
  s = mult > 1 ? s.replace(',', '.') : s.replace(/[.,]/g, '');
  const n = Number(s) * mult;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export function normalizeClausulazo(input = {}) {
  const errors = [];
  const value = {
    id: clean(input.id, 40) || makeId(),
    jugador: clean(input.jugador),
    club: clean(input.club, 40),
    posicion: POSICIONES[input.posicion] ? input.posicion : '',
    comprador: clean(input.comprador),
    vendedor: clean(input.vendedor),
    importe: parseImporte(input.importe),
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(String(input.fecha)) ? input.fecha : '',
    createdAt: Number.isFinite(Number(input.createdAt)) && input.createdAt ? Number(input.createdAt) : Date.now(),
  };

  if (!value.jugador) errors.push('Falta el nombre del jugador.');
  if (!value.comprador) errors.push('Falta quién ha pagado la cláusula.');
  if (!value.vendedor) errors.push('Falta a quién se la han hecho.');
  if (value.comprador && value.comprador === value.vendedor) {
    errors.push('Nadie se hace un clausulazo a sí mismo. Revisa comprador y víctima.');
  }
  if (!value.importe) errors.push('El importe no es válido. Escribe algo como 2.115.000 o 2,1M.');
  if (!value.fecha) errors.push('La fecha no es válida.');

  return { value, errors };
}
