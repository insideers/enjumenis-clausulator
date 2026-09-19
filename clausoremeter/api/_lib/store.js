import { Redis } from '@upstash/redis';
import { SEED } from '../../shared/seed.js';

export const KEY = 'enjumenis:clausulazos';
export const CRONICAS_KEY = 'enjumenis:cronicas';

let client;

// Busca las variables aunque Vercel les haya puesto un prefijo (p. ej. STORAGE_KV_REST_API_URL)
function findEnv(patterns) {
  const keys = Object.keys(process.env);
  for (const pattern of patterns) {
    const key = keys.find((k) => pattern.test(k) && process.env[k]);
    if (key) return process.env[key];
  }
  return undefined;
}

export function getRedis() {
  const url = findEnv([/^KV_REST_API_URL$/, /^UPSTASH_REDIS_REST_URL$/, /KV_REST_API_URL$/, /REDIS_REST_URL$/]);
  const token = findEnv([
    /^KV_REST_API_TOKEN$/,
    /^UPSTASH_REDIS_REST_TOKEN$/,
    /(?<!READ_ONLY_)KV_REST_API_TOKEN$/,
    /(?<!READ_ONLY_)REDIS_REST_TOKEN$/,
  ]);
  if (!url || !token) {
    const vistas = Object.keys(process.env).filter((k) => /KV|REDIS|UPSTASH/i.test(k));
    const err = new Error(
      `No encuentro las variables de Upstash Redis. ${
        vistas.length ? `Variables parecidas que sí veo: ${vistas.join(', ')}.` : 'No veo ninguna variable de Redis.'
      } Conecta la base de datos al proyecto en Storage y haz Redeploy.`
    );
    err.status = 503;
    throw err;
  }
  if (!client) client = new Redis({ url, token });
  return client;
}

export async function readAll(redis) {
  const data = await redis.get(KEY);
  if (Array.isArray(data)) return data;
  // Primera vez: se rellena con los clausulazos iniciales.
  await redis.set(KEY, SEED);
  return [...SEED];
}

export async function writeAll(redis, list) {
  await redis.set(KEY, list);
  return list;
}

export function checkAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { ok: false, status: 503, error: 'Falta la variable ADMIN_PASSWORD en Vercel. Añádela y vuelve a desplegar.' };
  }
  let given = req.headers['x-admin-password'] || '';
  try {
    given = decodeURIComponent(given);
  } catch {
    /* se deja tal cual */
  }
  if (given !== expected) {
    return { ok: false, status: 401, error: 'Contraseña incorrecta. Aquí solo apunta clausulazos el delegado.' };
  }
  return { ok: true };
}

export function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export async function readCronicas(redis) {
  const data = await redis.get(CRONICAS_KEY);
  return Array.isArray(data) ? data : [];
}

export async function writeCronicas(redis, list) {
  const ordenadas = [...list].sort((a, b) => a.jornada - b.jornada);
  await redis.set(CRONICAS_KEY, ordenadas);
  return ordenadas;
}
