// Mánagers de la Enjumenis League.
// Si alguien entra o se cambia el nombre del equipo, se edita aquí.
// "short" es el nombre corto que se usa en tablas estrechas.

export const MANAGERS = [
  { name: 'Cocidito Madrileño', short: 'Cocidito', color: '#F08A4B' },
  { name: 'Maese Xavier', short: 'Maese', color: '#E4B363' },
  { name: 'Fuentes de Ebro', short: 'Fuentes', color: '#A98BE0' },
  { name: 'El Pingüino Dubasin', short: 'Pingüino', color: '#F26D7D' },
  { name: 'Antonio Ureña', short: 'Ureña', color: '#7FB2F0' },
  { name: 'xun-xin-xu-a xi-xa-xun-xi', short: 'Xun-xin', color: '#E8D86F' },
  { name: 'La Toffoleta', short: 'Toffoleta', color: '#6ED3C6' },
  { name: 'D. Vedat Muriqi', short: 'Muriqi', color: '#D99BE0' },
  { name: 'Capocarlitos', short: 'Capocarlitos', color: '#F5A962' },
  { name: 'Fans de Coral Simanovich', short: 'Coral', color: '#F59BC5' },
  { name: 'Moneyball', short: 'Moneyball', color: '#9DB8F2' },
  { name: 'Anyád Papucsa', short: 'Papucsa', color: '#9BE3A6' },
  { name: 'Universidad de la Pizarra', short: 'Pizarra', color: '#C9CFC9' },
];

export const MANAGER_NAMES = MANAGERS.map((m) => m.name);

export function managerInfo(name) {
  const found = MANAGERS.find((m) => m.name === name);
  if (found) return found;
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { name, short: name, color: `hsl(${h % 360} 70% 72%)` };
}

export function initials(name) {
  const words = String(name)
    .replace(/^(el|la|los|las|d\.)\s+/i, '')
    .split(/[\s-]+/)
    .filter((w) => w && !['de', 'del', 'la', 'el'].includes(w.toLowerCase()));
  return (words.slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
}
