import { MANAGER_NAMES } from './managers.js';

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

// ---------- Crónicas semanales ----------

const texto = (v, max = 4000) => String(v ?? '').trim().slice(0, max);

function lista(v) {
  if (Array.isArray(v)) return v.map((x) => texto(x)).filter(Boolean);
  const t = texto(v);
  return t ? t.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean) : [];
}

export function normalizeCronica(input = {}) {
  const errors = [];
  const jornada = Number.parseInt(input.jornada, 10);

  const value = {
    jornada: Number.isFinite(jornada) ? jornada : null,
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(String(input.fecha)) ? input.fecha : new Date().toISOString().slice(0, 10),
    titular: texto(input.titular, 200),
    entradilla: texto(input.entradilla, 500),
    cuerpo: lista(input.cuerpo),
    piezas: (Array.isArray(input.piezas) ? input.piezas : []).slice(0, 6).map((p) => ({
      kicker: texto(p?.kicker, 40),
      titular: texto(p?.titular, 160),
      texto: texto(p?.texto, 1200),
    })),
    vaticinios: (Array.isArray(input.vaticinios) ? input.vaticinios : []).slice(0, 6).map((v) => ({
      titular: texto(v?.titular, 160),
      texto: texto(v?.texto, 1200),
    })),
    unoPorUno: (Array.isArray(input.unoPorUno) ? input.unoPorUno : []).map((u) => ({
      manager: texto(u?.manager, 80),
      nota: u?.nota === '' || u?.nota == null ? null : Number(u.nota),
      texto: texto(u?.texto, 600),
    })),
    actualizada: Date.now(),
  };

  if (value.jornada === null || value.jornada < 1) errors.push('Falta el número de jornada.');
  if (!value.titular) errors.push('Falta el titular principal.');
  if (!value.cuerpo.length && !value.piezas.length) errors.push('La crónica está vacía: pon al menos un cuerpo o una pieza.');
  value.piezas.forEach((p, i) => {
    if (!p.titular || !p.texto) errors.push(`La pieza nº ${i + 1} necesita titular y texto.`);
  });
  value.unoPorUno.forEach((u, i) => {
    if (!MANAGER_NAMES.includes(u.manager)) errors.push(`El mánager "${u.manager || '(vacío)'}" de la fila ${i + 1} del uno por uno no existe.`);
    if (u.nota !== null && !Number.isFinite(u.nota)) errors.push(`La nota de ${u.manager} no es un número.`);
  });

  return { value, errors };
}

/** Devuelve los mánagers que no aparecen por ninguna parte de la crónica. */
export function managersSinMencion(cronica) {
  if (!cronica) return [...MANAGER_NAMES];
  const todo = [
    cronica.titular,
    cronica.entradilla,
    ...(cronica.cuerpo || []),
    ...(cronica.piezas || []).flatMap((p) => [p.kicker, p.titular, p.texto]),
    ...(cronica.vaticinios || []).flatMap((v) => [v.titular, v.texto]),
    ...(cronica.unoPorUno || []).flatMap((u) => [u.manager, u.texto]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return MANAGER_NAMES.filter((n) => !todo.includes(n.toLowerCase()));
}
