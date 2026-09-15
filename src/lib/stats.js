import { MANAGER_NAMES } from '../../shared/managers.js';

const chrono = (a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.createdAt || 0) - (b.createdAt || 0);
const keyJugador = (s) => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Devuelve todos los empatados en el valor máximo/mínimo
function leaders(rows, key, { dir = 'max', filter = () => true } = {}) {
  const pool = rows.filter(filter);
  if (!pool.length) return { value: null, rows: [] };
  const vals = pool.map((r) => r[key]);
  const value = dir === 'max' ? Math.max(...vals) : Math.min(...vals);
  return { value, rows: pool.filter((r) => r[key] === value) };
}

function rankBy(rows, key, tiebreak) {
  return [...rows].sort((a, b) => b[key] - a[key] || (tiebreak ? b[tiebreak] - a[tiebreak] : 0) || a.name.localeCompare(b.name));
}

export function computeStats(input) {
  const list = [...input].sort(chrono);
  const names = [...new Set([...MANAGER_NAMES, ...list.flatMap((c) => [c.comprador, c.vendedor])])];

  const by = Object.fromEntries(
    names.map((name) => [name, { name, hechos: 0, recibidos: 0, gastado: 0, cobrado: 0, ultimoHecho: null, ultimoRecibido: null }])
  );
  const pairs = new Map();
  const players = new Map();
  const days = new Map();
  const matrix = Object.fromEntries(names.map((n) => [n, Object.fromEntries(names.map((m) => [m, 0]))]));

  for (const c of list) {
    const buyer = by[c.comprador];
    const victim = by[c.vendedor];
    buyer.hechos += 1;
    buyer.gastado += c.importe;
    buyer.ultimoHecho = c;
    victim.recibidos += 1;
    victim.cobrado += c.importe;
    victim.ultimoRecibido = c;
    matrix[c.comprador][c.vendedor] += 1;

    const pk = `${c.comprador}\u0000${c.vendedor}`;
    const pair = pairs.get(pk) || { comprador: c.comprador, vendedor: c.vendedor, count: 0, total: 0 };
    pair.count += 1;
    pair.total += c.importe;
    pairs.set(pk, pair);

    const jk = keyJugador(c.jugador);
    const pl = players.get(jk) || { jugador: c.jugador, club: c.club, count: 0, total: 0, movimientos: [] };
    pl.count += 1;
    pl.total += c.importe;
    pl.movimientos.push(c);
    players.set(jk, pl);

    if (c.fecha) {
      const d = days.get(c.fecha) || { fecha: c.fecha, count: 0, total: 0 };
      d.count += 1;
      d.total += c.importe;
      days.set(c.fecha, d);
    }
  }

  const managers = Object.values(by).map((m) => ({
    ...m,
    balance: m.cobrado - m.gastado,
    mediaPagada: m.hechos ? m.gastado / m.hechos : 0,
    implicado: m.hechos + m.recibidos,
  }));

  const total = list.length;
  const dinero = list.reduce((s, c) => s + c.importe, 0);
  const importes = list.map((c) => c.importe).sort((a, b) => a - b);
  const mediana = total ? (total % 2 ? importes[(total - 1) / 2] : (importes[total / 2 - 1] + importes[total / 2]) / 2) : 0;

  // Mismo jugador que vuelve a casa por la misma vía
  const idaYVuelta = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (keyJugador(a.jugador) === keyJugador(b.jugador) && b.comprador === a.vendedor && b.vendedor === a.comprador) {
        idaYVuelta.push({ jugador: a.jugador, ida: a, vuelta: b });
      }
    }
  }

  // Pares de mánagers que se han robado mutuamente
  const vendettas = [];
  for (const p of pairs.values()) {
    const back = pairs.get(`${p.vendedor}\u0000${p.comprador}`);
    if (back && p.comprador < p.vendedor) vendettas.push({ a: p.comprador, b: p.vendedor, ab: p.count, ba: back.count });
  }

  // Derbi: pareja de mánagers con más clausulazos entre ellos, sumando ambas direcciones
  const derbis = new Map();
  for (const p of pairs.values()) {
    const [a, b] = [p.comprador, p.vendedor].sort();
    const d = derbis.get(`${a}\u0000${b}`) || { a, b, ab: 0, ba: 0, total: 0 };
    if (p.comprador === a) d.ab += p.count;
    else d.ba += p.count;
    d.total += p.total;
    derbis.set(`${a}\u0000${b}`, d);
  }
  const derbiList = [...derbis.values()].sort((x, y) => y.ab + y.ba - (x.ab + x.ba) || y.total - x.total);
  const derbi = derbiList[0] && derbiList[0].ab + derbiList[0].ba > 1 ? derbiList[0] : null;

  const pairList = [...pairs.values()].sort((a, b) => b.count - a.count || b.total - a.total);
  const playerList = [...players.values()].sort((a, b) => b.count - a.count || b.total - a.total);

  // Calendario continuo desde el primer al último día con clausulazos
  const timeline = [];
  if (days.size) {
    const sorted = [...days.keys()].sort();
    const start = new Date(`${sorted[0]}T12:00:00Z`);
    const end = new Date(`${sorted[sorted.length - 1]}T12:00:00Z`);
    for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
      const iso = d.toISOString().slice(0, 10);
      timeline.push(days.get(iso) || { fecha: iso, count: 0, total: 0 });
    }
  }

  const awards = {
    pichichi: leaders(managers, 'hechos', { filter: (m) => m.hechos > 0 }),
    coladero: leaders(managers, 'recibidos', { filter: (m) => m.recibidos > 0 }),
    florentino: leaders(managers, 'gastado', { filter: (m) => m.gastado > 0 }),
    hucha: leaders(managers, 'cobrado', { filter: (m) => m.cobrado > 0 }),
    farolillo: leaders(managers, 'balance', { dir: 'min', filter: (m) => m.recibidos > 0 && m.balance < 0 }),
    jeque: leaders(managers, 'mediaPagada', { filter: (m) => m.hechos >= 2 }),
    gangas: leaders(managers, 'mediaPagada', { dir: 'min', filter: (m) => m.hechos >= 2 }),
    candado: managers.filter((m) => m.recibidos === 0 && m.hechos > 0),
    cholo: managers.filter((m) => m.hechos === 0 && m.recibidos > 0),
    fantasmas: managers.filter((m) => m.implicado === 0),
  };

  return {
    list,
    total,
    dinero,
    media: total ? dinero / total : 0,
    mediana,
    ultimo: list[list.length - 1] || null,
    masCaro: total ? list.reduce((a, b) => (b.importe > a.importe ? b : a)) : null,
    masBarato: total ? list.reduce((a, b) => (b.importe < a.importe ? b : a)) : null,
    managers,
    rankings: {
      hechos: rankBy(managers, 'hechos', 'gastado'),
      recibidos: rankBy(managers, 'recibidos', 'cobrado'),
      gastado: rankBy(managers, 'gastado'),
      cobrado: rankBy(managers, 'cobrado'),
      balance: rankBy(managers, 'balance'),
    },
    awards,
    pairList,
    derbi,
    playerList,
    masRobados: playerList[0] && playerList[0].count > 1 ? playerList.filter((p) => p.count === playerList[0].count) : [],
    idaYVuelta,
    vendettas,
    timeline,
    diaCaliente: [...days.values()].sort((a, b) => b.count - a.count || b.total - a.total)[0] || null,
    matrix,
    names,
  };
}

// Datos para la ficha individual
export function managerProfile(stats, name) {
  const m = stats.managers.find((x) => x.name === name);
  if (!m) return null;
  const verdugos = Object.entries(stats.matrix)
    .map(([buyer, row]) => ({ name: buyer, count: row[name] || 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const victimas = Object.entries(stats.matrix[name] || {})
    .map(([victim, count]) => ({ name: victim, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const pos = (key) => stats.rankings[key].findIndex((x) => x.name === name) + 1;
  return {
    ...m,
    verdugo: verdugos[0] || null,
    victima: victimas[0] || null,
    posHechos: pos('hechos'),
    posRecibidos: pos('recibidos'),
    movimientos: stats.list.filter((c) => c.comprador === name || c.vendedor === name).reverse(),
  };
}
