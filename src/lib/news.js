import { fmtEur, fmtM, fmtFecha, todayISO } from './format.js';

const keyJugador = (s) => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const shift = (iso, days) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);

function count(items, key) {
  const m = new Map();
  for (const c of items) m.set(c[key], (m.get(c[key]) || 0) + 1);
  return [...m.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
}

const sum = (items, key, name) => items.filter((c) => c[key] === name).reduce((s, c) => s + c.importe, 0);

// Coge las mejores noticias repartiendo el foco: nadie protagoniza más de dos titulares
function elegir(items, max) {
  const ordenadas = [...items].sort((a, b) => b.peso - a.peso);
  const veces = new Map();
  const elegidas = [];
  for (const limite of [2, Infinity]) {
    for (const item of ordenadas) {
      if (elegidas.length >= max) break;
      if (elegidas.includes(item)) continue;
      const n = item.protagonista ? veces.get(item.protagonista) || 0 : 0;
      if (n >= limite) continue;
      if (item.protagonista) veces.set(item.protagonista, n + 1);
      elegidas.push(item);
    }
  }
  return elegidas;
}

/**
 * Construye las noticias de la semana a partir de los clausulazos.
 * Si no ha pasado nada en los últimos 7 días, coge la última semana con movimiento.
 */
export function buildNews(stats, { days = 7, hoy = todayISO() } = {}) {
  const all = stats.list;
  if (!all.length) return { items: [], desde: '', hasta: '', reciente: true };

  let hasta = hoy;
  let desde = shift(hasta, -(days - 1));
  let semana = all.filter((c) => c.fecha >= desde && c.fecha <= hasta);
  let reciente = true;

  if (semana.length < 2) {
    hasta = all[all.length - 1].fecha;
    desde = shift(hasta, -(days - 1));
    semana = all.filter((c) => c.fecha >= desde && c.fecha <= hasta);
    reciente = hasta >= shift(hoy, -(days - 1));
  }
  if (!semana.length) return { items: [], desde, hasta, reciente };

  const anteriores = all.filter((c) => c.fecha < desde);
  const caro = semana.reduce((a, b) => (b.importe > a.importe ? b : a));
  const barato = semana.reduce((a, b) => (b.importe < a.importe ? b : a));
  const gasto = semana.reduce((s, c) => s + c.importe, 0);
  const verdugos = count(semana, 'comprador');
  const victimas = count(semana, 'vendedor');
  const items = [];

  // Fichaje más caro de la semana
  const esRecord = stats.masCaro && stats.masCaro.id === caro.id;
  items.push({
    id: `caro-${caro.id}`,
    peso: esRecord ? 100 : 80,
    protagonista: caro.comprador,
    kicker: esRecord ? 'Récord de la liga' : 'Bombazo',
    titular: `${caro.comprador} revienta la hucha por ${caro.jugador}`,
    cuerpo: esRecord
      ? `${fmtEur(caro.importe)}, el clausulazo más caro de la historia de la Enjumenis. En ${caro.vendedor} todavía están mirando la notificación con cara de tonto, y el resto de la liga haciendo cuentas de lo que vale ahora blindar a nadie.`
      : `${fmtEur(caro.importe)} para sacárselo a ${caro.vendedor}. Ni oferta ni negociación: cláusula pagada y a otra cosa.`,
    fecha: caro.fecha,
  });

  // Alguien devuelve el golpe
  const venganzas = semana
    .map((c) => {
      // Golpes anteriores en sentido contrario, el mismo jugador primero
      const contrarios = all.filter(
        (x) =>
          x.comprador === c.vendedor &&
          x.vendedor === c.comprador &&
          (x.fecha < c.fecha || (x.fecha === c.fecha && x.createdAt < c.createdAt))
      );
      const previo = contrarios.find((x) => keyJugador(x.jugador) === keyJugador(c.jugador)) || contrarios[0];
      const mismoJugador = Boolean(previo) && keyJugador(previo.jugador) === keyJugador(c.jugador);
      return previo ? { c, previo, mismoJugador } : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(b.mismoJugador) - Number(a.mismoJugador) ||
        b.c.fecha.localeCompare(a.c.fecha) ||
        b.c.importe - a.c.importe
    )[0];

  if (venganzas) {
    const { c, previo, mismoJugador } = venganzas;
    items.push({
      id: `venganza-${c.id}`,
      protagonista: c.comprador,
      peso: mismoJugador ? 95 : 70,
      kicker: mismoJugador ? 'Ida y vuelta' : 'Ojo por ojo',
      titular: mismoJugador
        ? `${c.comprador} recupera a ${c.jugador} y se venga`
        : `${c.comprador} le devuelve la visita a ${c.vendedor}`,
      cuerpo: mismoJugador
        ? `${c.vendedor} se lo había llevado por ${fmtEur(previo.importe)} el ${fmtFecha(previo.fecha)} y ahora vuelve a casa por ${fmtEur(c.importe)}. El jugador ya ni deshace la maleta y la cuenta corriente de los dos llora por igual.`
        : `Después de que ${c.vendedor} le quitara a ${previo.jugador}, ${c.comprador} ha respondido llevándose a ${c.jugador} por ${fmtEur(c.importe)}. Aquí ya no se perdona nada.`,
      fecha: c.fecha,
    });
  }

  // El que más ha robado esta semana
  const lider = verdugos[0];
  if (lider && lider.n > 1) {
    const gastado = sum(semana, 'comprador', lider.name);
    items.push({
      id: `racha-${lider.name}`,
      protagonista: lider.name,
      peso: 75 + lider.n,
      kicker: 'Semana de saqueo',
      titular: `${lider.name} firma ${lider.n} clausulazos en siete días`,
      cuerpo: `${fmtM(gastado)} gastados en una semana. A este ritmo le va a hacer falta un armario más grande para tanta camiseta ajena, y al resto de la liga una alarma en casa.`,
      fecha: hasta,
    });
  }

  // La víctima de la semana
  const pobre = victimas[0];
  if (pobre && pobre.n > 1) {
    const cobrado = sum(semana, 'vendedor', pobre.name);
    items.push({
      id: `victima-${pobre.name}`,
      protagonista: pobre.name,
      peso: 74 + pobre.n,
      kicker: 'Crisis institucional',
      titular: `${pobre.name} pierde ${pobre.n} jugadores en una semana`,
      cuerpo: `Se ha embolsado ${fmtM(cobrado)}, que es el premio de consolación por quedarse con el vestuario medio vacío. Alguien debería explicarle para qué sirve subir cláusulas.`,
      fecha: hasta,
    });
  }

  // Un jugador que ya había cambiado de manos antes
  const reincidente = semana
    .map((c) => ({ c, veces: all.filter((x) => keyJugador(x.jugador) === keyJugador(c.jugador)).length }))
    .filter((x) => x.veces > 1)
    .sort((a, b) => b.veces - a.veces || b.c.importe - a.c.importe)[0];

  if (reincidente && !items.some((i) => i.id.endsWith(reincidente.c.id))) {
    items.push({
      id: `manoseado-${reincidente.c.id}`,
      protagonista: reincidente.c.comprador,
      peso: 60 + reincidente.veces,
      kicker: 'Maleta en la puerta',
      titular: `${reincidente.c.jugador} cambia de casa por ${reincidente.veces}ª vez`,
      cuerpo: `Ahora se lo lleva ${reincidente.c.comprador} de ${reincidente.c.vendedor} por ${fmtEur(reincidente.c.importe)}. El pobre ya saluda a los de la mudanza por su nombre de pila.`,
      fecha: reincidente.c.fecha,
    });
  }

  // Primera vez de alguien
  const debutante = semana.find((c) => !anteriores.some((x) => x.comprador === c.comprador));
  if (debutante) {
    items.push({
      id: `debut-${debutante.id}`,
      protagonista: debutante.comprador,
      peso: 55,
      kicker: 'Se estrena',
      titular: `${debutante.comprador} se quita la etiqueta de pacífico`,
      cuerpo: `Primer clausulazo de la temporada: ${fmtEur(debutante.importe)} por ${debutante.jugador}, y la víctima es ${debutante.vendedor}. Ya no puede mirar a nadie por encima del hombro.`,
      fecha: debutante.fecha,
    });
  }

  // La ganga de la semana
  if (barato.id !== caro.id) {
    items.push({
      id: `ganga-${barato.id}`,
      protagonista: barato.comprador,
      peso: 45,
      kicker: 'Cazador de gangas',
      titular: `${barato.comprador} se lleva a ${barato.jugador} por calderilla`,
      cuerpo: `${fmtEur(barato.importe)}. En ${barato.vendedor} tenían la cláusula más baja que el precio del bocata del descanso y alguien pasaba por ahí.`,
      fecha: barato.fecha,
    });
  }

  // Resumen económico de la semana
  items.push({
    id: 'resumen',
    protagonista: null,
    peso: 40,
    kicker: 'Cierre de mercado',
    titular: `${semana.length} ${semana.length === 1 ? 'clausulazo' : 'clausulazos'} y ${fmtM(gasto)} en una semana`,
    cuerpo: `${verdugos.length} ${verdugos.length === 1 ? 'mánager ha pagado' : 'mánagers han pagado'} cláusulas y ${victimas.length} ${
      victimas.length === 1 ? 'se ha quedado' : 'se han quedado'
    } sin jugador. El resto mira el móvil de reojo esperando su turno.`,
    fecha: hasta,
  });

  return {
    items: elegir(items, 4),
    desde,
    hasta,
    reciente,
  };
}
