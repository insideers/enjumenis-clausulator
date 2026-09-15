import { fmtM } from './format.js';

function hash(s) {
  let h = 7;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Elige siempre la misma frase para el mismo clausulazo (no cambia al recargar)
export const pickBy = (seed, arr) => arr[hash(seed) % arr.length];

export const HERO_LINES = [
  (c) => `En ${c.vendedor} se han enterado por la notificación, como todo el mundo.`,
  (c) => `${c.comprador} no negocia. ${c.comprador} ejecuta.`,
  () => 'Ni oferta, ni llamada, ni un triste mensaje. Cláusula, firma y a casa.',
  (c) => `${c.jugador} ya ha cambiado la foto de perfil.`,
  (c) => `Alguien en ${c.vendedor} debería haber subido esa cláusula ayer.`,
  () => 'El VAR lo ha revisado y es legal. Duele igual.',
  (c) => `${c.vendedor} pide calma a su afición. La afición no está calmada.`,
];

export const pluralClaus = (n) => `${n} ${n === 1 ? 'clausulazo' : 'clausulazos'}`;

export const AWARDS = {
  pichichi: {
    title: 'Pichichi del Robo',
    card: 'yellow',
    stat: (v) => pluralClaus(v),
    line: 'Este no ficha, desvalija. Cierra la puerta cuando lo veas conectado.',
  },
  coladero: {
    title: 'Portero Coladero',
    card: 'red',
    stat: (v) => `${pluralClaus(v)} encajados`,
    line: 'Le entran por todas partes. Ni con cinco defensas y el autobús aparcado.',
  },
  florentino: {
    title: 'El Florentino',
    card: 'yellow',
    stat: (v) => `${fmtM(v)} en cláusulas`,
    line: 'Los galácticos no se pagan solos. El banco ya le manda felicitaciones de Navidad.',
  },
  hucha: {
    title: 'Vendedor a su pesar',
    card: 'red',
    stat: (v) => `${fmtM(v)} ingresados`,
    line: 'Tiene la caja llena y la plantilla vacía. Negocio redondo, dice él.',
  },
  farolillo: {
    title: 'Farolillo Rojo del Mercado',
    card: 'red',
    stat: (v) => `${fmtM(Math.abs(v))} en negativo`,
    line: 'Le roban jugadores y aun así paga más de lo que cobra. Hacienda ya ha abierto expediente.',
  },
  jeque: {
    title: 'El Jeque',
    card: 'yellow',
    stat: (v) => `${fmtM(v)} de media por clausulazo`,
    line: 'No mira precios, mira escudos. Si es caro, mejor.',
  },
  gangas: {
    title: 'Rey del Rastro',
    card: 'yellow',
    stat: (v) => `${fmtM(v)} de media por clausulazo`,
    line: 'Solo roba lo que está de oferta. Clausulazo sí, pero con cupón descuento.',
  },
};

export function verdict(p) {
  if (!p || p.implicado === 0) return 'Ni roba ni le roban. ¿Sigue en la liga o se le olvidó la contraseña?';
  if (p.hechos === 0) return 'Solo aparece en las noticias como víctima. Saco de boxeo oficial de la Enjumenis.';
  if (p.recibidos === 0) return 'Roba y nadie le devuelve el golpe. De momento.';
  if (p.hechos >= p.recibidos * 2) return 'Depredador. Mira las plantillas ajenas como quien mira un escaparate.';
  if (p.recibidos >= p.hechos * 2) return 'Le quitan jugadores más rápido de lo que los ficha. Plantilla de temporada de rebajas.';
  if (p.balance > 0) return 'Cobra más de lo que gasta. O es un genio de los negocios o simplemente le desvalijan con estilo.';
  return 'Gasta más de lo que cobra. El director financiero ha dimitido.';
}

export const EMPTY_LINES = {
  candado: 'Roba y nadie le ha tocado un jugador. O blinda como nadie o nadie quiere a sus jugadores.',
  cholo: 'Le roban y no devuelve ni uno. Partido a partido y la cartera bien cerrada.',
  fantasmas: 'Ni roban ni les roban. ¿Siguen en la liga o se les olvidó la contraseña?',
};
