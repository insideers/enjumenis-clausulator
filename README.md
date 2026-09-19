# Clausoremeter · Enjumenis League

Dashboard de clausulazos de la Enjumenis League: seis tarjetas de premios, la crónica semanal, rankings de hechos y recibidos, dinero gastado y cobrado, balance neto, matriz del rencor, calendario de atracos y ficha de cada mánager.


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

## El Diario de la Enjumenis (crónica semanal)

La crónica escrita a mano de cada jornada es lo primero de la web: cabecera de periódico, teletipo con la última hora del mercado y hasta dos artículos principales. Debajo, en "Más de la jornada", van las piezas (hasta 15, por ejemplo una por equipo), los vaticinios y el uno por uno con nota. Después ya viene todo lo del mercado. Las crónicas se guardan en la base de datos, así que **no hay que tocar el código ni desplegar nada** para publicar una nueva.

1. En la zona del delegado, pestaña **Crónica**.
2. Pega el JSON de la semana. Debajo del cuadro sale una revisión: si el JSON está mal, qué falla, y qué mánagers no aparecen mencionados en ningún texto.
3. Pulsa **Publicar crónica**. Si ya existe una crónica con esa jornada, se sustituye.

Desde esa misma pestaña se borran crónicas antiguas, y el botón "Pegar plantilla vacía" rellena el cuadro con la estructura completa y los 13 mánagers listos.

Formato:

```json
{
  "jornada": 7,
  "fecha": "2026-09-21",
  "principales": [
    { "titular": "Titular principal", "entradilla": "Resumen en una o dos frases", "cuerpo": ["Párrafo uno", "Párrafo dos"] },
    { "titular": "Segundo titular", "entradilla": "", "cuerpo": ["Párrafo"] }
  ],
  "piezas": [{ "kicker": "El pique", "titular": "Titular corto", "texto": "El salseo" }],
  "vaticinios": [{ "titular": "Underdog de la jornada", "texto": "La predicción" }],
  "unoPorUno": [{ "manager": "Maese Xavier", "nota": 9, "texto": "Su puyita" }]
}
```

Solo son obligatorios `jornada`, un titular en `principales` y algo de contenido (`cuerpo` o `piezas`). Los nombres de `manager` tienen que coincidir con los de `shared/managers.js`.

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
