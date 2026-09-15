import { Redis } from '@upstash/redis';
import { SEED } from '../../shared/seed.js';

export const KEY = 'enjumenis:clausulazos';

let client;

export function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    const err = new Error(
      'No hay base de datos conectada. En Vercel ve a Storage, crea una base Upstash Redis y conéctala al proyecto.'
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
  // Primera vez: se rellena con los clausulazos de las capturas.
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
