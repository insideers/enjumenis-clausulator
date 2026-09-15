// Datos iniciales sacados de las capturas de MisterMD (15/09/2026).
// Solo se usan la primera vez: si la base de datos está vacía, se rellena con esto.
// Las fechas son aproximadas: la app solo mostraba "hace X días".
// comprador = quien paga la cláusula; vendedor = a quien se la hacen.

export const SEED = [
  { id: 's21', jugador: 'Sergio Martinez', club: 'Real Madrid', posicion: 'MC', vendedor: 'Antonio Ureña', comprador: 'El Pingüino Dubasin', importe: 1000000, fecha: '2026-08-16' },
  { id: 's22', jugador: 'Javi Rodríguez', club: 'Celta', posicion: 'DF', vendedor: 'Fuentes de Ebro', comprador: 'Maese Xavier', importe: 3300000, fecha: '2026-08-16' },
  { id: 's23', jugador: 'Ángel Pérez', club: 'Alavés', posicion: 'MC', vendedor: 'Universidad de la Pizarra', comprador: 'Cocidito Madrileño', importe: 4924500, fecha: '2026-08-20' },
  { id: 's24', jugador: 'Javi Hernandez', club: 'Espanyol', posicion: 'MC', vendedor: 'La Toffoleta', comprador: 'Maese Xavier', importe: 2666666, fecha: '2026-08-21' },
  { id: 's01', jugador: 'Sergio Martinez', club: 'Real Madrid', posicion: 'MC', vendedor: 'El Pingüino Dubasin', comprador: 'Moneyball', importe: 3000000, fecha: '2026-08-22' },
  { id: 's25', jugador: 'Javi Rodríguez', club: 'Celta', posicion: 'DF', vendedor: 'Maese Xavier', comprador: 'Cocidito Madrileño', importe: 4950000, fecha: '2026-08-26' },
  { id: 's02', jugador: 'Yoel Lago', club: 'Celta', posicion: 'DF', vendedor: 'Anyád Papucsa', comprador: 'Fuentes de Ebro', importe: 1000000, fecha: '2026-08-28' },
  { id: 's03', jugador: 'Unai López', club: 'Rayo Vallecano', posicion: 'MC', vendedor: 'Fans de Coral Simanovich', comprador: 'Cocidito Madrileño', importe: 4062000, fecha: '2026-08-28' },
  { id: 's04', jugador: 'Xavi Espart', club: 'Barcelona', posicion: 'DF', vendedor: 'Cocidito Madrileño', comprador: 'Maese Xavier', importe: 2712630, fecha: '2026-08-30' },
  { id: 's05', jugador: 'Roger Brugué', club: 'Levante', posicion: 'MC', vendedor: 'Maese Xavier', comprador: 'xun-xin-xu-a xi-xa-xun-xi', importe: 2666666, fecha: '2026-08-31' },
  { id: 's06', jugador: 'Oriol Rey', club: 'Levante', posicion: 'MC', vendedor: 'Fuentes de Ebro', comprador: 'Fans de Coral Simanovich', importe: 1473000, fecha: '2026-08-31' },
  { id: 's07', jugador: 'Jesús Areso', club: 'Athletic', posicion: 'DF', vendedor: 'Maese Xavier', comprador: 'xun-xin-xu-a xi-xa-xun-xi', importe: 1788000, fecha: '2026-09-01' },
  { id: 's08', jugador: 'Ángel Recio', club: 'Málaga', posicion: 'DF', vendedor: 'El Pingüino Dubasin', comprador: 'Fans de Coral Simanovich', importe: 1261500, fecha: '2026-09-01' },
  { id: 's09', jugador: 'Pablo García', club: 'Racing', posicion: 'DL', vendedor: 'xun-xin-xu-a xi-xa-xun-xi', comprador: 'Maese Xavier', importe: 2370000, fecha: '2026-09-04' },
  { id: 's10', jugador: 'Luismi Cruz', club: 'Deportivo', posicion: 'MC', vendedor: 'xun-xin-xu-a xi-xa-xun-xi', comprador: 'Moneyball', importe: 3768000, fecha: '2026-09-06' },
  { id: 's11', jugador: 'Andreas Christensen', club: 'Barcelona', posicion: 'DF', vendedor: 'Anyád Papucsa', comprador: 'El Pingüino Dubasin', importe: 2769000, fecha: '2026-09-07' },
  { id: 's12', jugador: 'Pablo Durán', club: 'Celta', posicion: 'DL', vendedor: 'Antonio Ureña', comprador: 'xun-xin-xu-a xi-xa-xun-xi', importe: 1132500, fecha: '2026-09-07' },
  { id: 's13', jugador: 'Adama Traoré', club: 'Deportivo', posicion: 'DL', vendedor: 'Anyád Papucsa', comprador: 'Antonio Ureña', importe: 3181500, fecha: '2026-09-07' },
  { id: 's14', jugador: 'Marc Bartra', club: 'Betis', posicion: 'DF', vendedor: 'Fans de Coral Simanovich', comprador: 'Anyád Papucsa', importe: 7517998, fecha: '2026-09-08' },
  { id: 's15', jugador: 'Andrés Castrín', club: 'Sevilla', posicion: 'DF', vendedor: 'Fans de Coral Simanovich', comprador: 'xun-xin-xu-a xi-xa-xun-xi', importe: 3306000, fecha: '2026-09-09' },
  { id: 's16', jugador: 'Roger Brugué', club: 'Levante', posicion: 'MC', vendedor: 'xun-xin-xu-a xi-xa-xun-xi', comprador: 'Maese Xavier', importe: 3999999, fecha: '2026-09-13' },
  { id: 's17', jugador: 'Miguel Román', club: 'Celta', posicion: 'MC', vendedor: 'Cocidito Madrileño', comprador: 'Anyád Papucsa', importe: 6285220, fecha: '2026-09-14' },
  { id: 's18', jugador: 'Marc Roca', club: 'Betis', posicion: 'MC', vendedor: 'Antonio Ureña', comprador: 'Moneyball', importe: 9358500, fecha: '2026-09-14' },
  { id: 's19', jugador: 'Thomas Lemar', club: 'Elche', posicion: 'MC', vendedor: 'Fans de Coral Simanovich', comprador: 'xun-xin-xu-a xi-xa-xun-xi', importe: 2700000, fecha: '2026-09-15' },
  { id: 's20', jugador: 'Marcos Fernández', club: 'Espanyol', posicion: 'DL', vendedor: 'Antonio Ureña', comprador: 'El Pingüino Dubasin', importe: 2115000, fecha: '2026-09-15' },
].map((c, i) => ({ ...c, createdAt: Date.parse(`${c.fecha}T00:00:00Z`) + i * 1000 }));
