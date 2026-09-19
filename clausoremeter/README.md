# Clausoremeter · Enjumenis League

Dashboard de clausulazos de la Enjumenis League: seis tarjetas de premios, la portada de la semana con titulares que se escriben solos, rankings de hechos y recibidos, dinero gastado y cobrado, balance neto, matriz del rencor, calendario de atracos y ficha de cada mánager.

La sección "La portada de la semana" coge los clausulazos de los últimos 7 días y elige los cuatro titulares con más salseo (récord, venganzas, rachas, víctimas, jugadores que no paran de mudarse…). Se actualiza sola al añadir clausulazos. Si en una semana no ha pasado nada, muestra la última semana con movimiento. Los textos están en `src/lib/news.js` por si quieres cambiarlos.

Hecho con Vite + React. Los clausulazos se guardan en Upstash Redis a través de dos funciones serverless de Vercel (`/api`), y se apuntan desde la propia web.

## Desplegar en Vercel

1. **Sube el proyecto a GitHub.** Al abrir el repo tienen que verse directamente `package.json`, `index.html` y las carpetas `api`, `src` y `shared`.
2. **Importa el repo en Vercel.** Detecta Vite solo; no toques los ajustes de build.
3. **Conecta la base de datos.** En el proyecto, pestaña **Storage**, crea una base **Upstash Redis** (plan gratuito) y conéctala al proyecto. Vercel añade las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **Añade la contraseña.** En **Settings → Environment Variables**, crea `ADMIN_PASSWORD`.
5. **Redeploy** para que el despliegue coja las variables.

La primera vez que alguien abra la web, la base de datos se rellena con los clausulazos de `shared/seed.js`. A partir de ahí manda la base de datos y el archivo ya no se usa.

## Uso

- **Ver el dashboard:** cualquiera con el enlace.
- **Apuntar un clausulazo:** botón "Zona del delegado", contraseña y formulario. El importe acepta `2.115.000`, `2115000` o `2,1M`.
- **Borrar:** con la sesión de delegado abierta aparece "Borrar" en cada fila del Acta del mercado.
- **Importar y exportar:** descarga una copia en JSON o pega una lista. "Añadir al historial" mezcla por `id`; "Reemplazar todo" borra lo que hay.

Formato de cada clausulazo:

```json
{
  "jugador": "Marc Roca",
  "club": "Betis",
  "posicion": "MC",
  "vendedor": "Antonio Ureña",
  "comprador": "Moneyball",
  "importe": 9358500,
  "fecha": "2026-09-14"
}
```

`vendedor` es a quien se lo hacen y `comprador` quien paga. `posicion` puede ser `PT`, `DF`, `MC`, `DL` o vacío.

## Si la web avisa de que está en modo solo lectura

Abre `tu-app.vercel.app/api/clausulazos`. El mensaje que salga dice qué falta: la base de datos sin conectar, la carpeta `api` fuera de la raíz del repo o un despliegue anterior a las variables.

## Cambiar mánagers

La lista de equipos, sus nombres cortos y colores está en `shared/managers.js`. Si alguien cambia el nombre del equipo, cámbialo ahí y también en los clausulazos antiguos: exporta la copia, busca y reemplaza, e importa con "Reemplazar todo".

## Probar en local

```bash
npm install
npm i -g vercel
vercel link
vercel env pull
vercel dev
```

Con `npm run dev` también arranca, pero sin API: muestra los datos iniciales en modo solo lectura.

## Notas sobre los datos

- Las fechas de los clausulazos sacados del feed de MisterMD son aproximadas, porque solo mostraba "hace X días". Las de las fichas de jugador son exactas.
- Las ventas directas a Mister (no por cláusula) no cuentan como clausulazo.
