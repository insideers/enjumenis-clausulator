# Clausoremeter · Enjumenis League

Dashboard de clausulazos de la Enjumenis League: rankings de hechos y recibidos, dinero gastado y cobrado, balance neto, matriz del rencor, calendario de atracos, ficha de cada mánager y premios con mala leche.

Hecho con Vite + React. Los datos se guardan en Upstash Redis a través de dos funciones serverless de Vercel (`/api`).

## Desplegar en Vercel

1. **Sube el proyecto a GitHub.** Crea un repo nuevo y sube esta carpeta tal cual (sin `node_modules`).
2. **Importa el repo en Vercel.** En vercel.com, "Add New Project" y elige el repo. Vercel detecta Vite solo; no toques los ajustes de build.
3. **Conecta la base de datos.** Dentro del proyecto en Vercel, ve a la pestaña **Storage**, crea una base **Upstash Redis** (el plan gratuito sobra) y conéctala al proyecto. Vercel añade solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **Pon la contraseña del delegado.** En **Settings → Environment Variables** añade `ADMIN_PASSWORD` con la contraseña que quieras.
5. **Vuelve a desplegar.** En la pestaña Deployments, "Redeploy" sobre el último despliegue para que coja las variables nuevas.

La primera vez que alguien abra la web, la base de datos se rellena sola con los 20 clausulazos iniciales (están en `shared/seed.js`).

## Uso

- **Ver el dashboard:** cualquiera con el enlace.
- **Apuntar un clausulazo:** botón "Zona del delegado", contraseña y formulario. El importe acepta `2.115.000`, `2115000` o `2,1M`.
- **Borrar:** con la sesión de delegado abierta aparece "Borrar" en cada fila del Acta del mercado.
- **Importar y exportar:** en la zona del delegado puedes descargar una copia en JSON o pegar una lista de clausulazos. "Añadir al historial" mezcla por `id`; "Reemplazar todo" borra lo que hay.

Formato de cada clausulazo:

```json
{
  "id": "s21",
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

## Cambiar mánagers

La lista de equipos, sus nombres cortos y colores está en `shared/managers.js`. Si alguien cambia el nombre del equipo, cámbialo ahí y también en los clausulazos antiguos (exporta, busca y reemplaza, e importa con "Reemplazar todo").

## Probar en local

```bash
npm install
npm i -g vercel
vercel link        # enlaza con el proyecto de Vercel
vercel env pull    # descarga las variables a .env.local
vercel dev
```

Con `npm run dev` también arranca, pero sin API: muestra los datos iniciales en modo solo lectura.

## Notas sobre los datos iniciales

- Las fechas son aproximadas: MisterMD solo mostraba "hace X días" y se calcularon desde el 15/09/2026.
- Los clubes se leyeron del escudo de cada captura.
- Las ventas directas a Mister (no por cláusula) no cuentan como clausulazo y no están incluidas.
