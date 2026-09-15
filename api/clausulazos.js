import { getRedis, readAll, writeAll, checkAdmin, readBody } from './_lib/store.js';
import { normalizeClausulazo } from '../shared/validate.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      return res.status(200).json(await readAll(redis));
    }

    const auth = checkAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    // Añadir un clausulazo
    if (req.method === 'POST') {
      const { value, errors } = normalizeClausulazo({ ...readBody(req), id: undefined, createdAt: undefined });
      if (errors.length) return res.status(400).json({ error: errors.join(' ') });
      const list = await readAll(redis);
      list.push(value);
      return res.status(201).json(await writeAll(redis, list));
    }

    // Borrar un clausulazo: DELETE /api/clausulazos?id=xxx
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '');
      const list = await readAll(redis);
      const next = list.filter((c) => c.id !== id);
      if (next.length === list.length) return res.status(404).json({ error: 'Ese clausulazo ya no existe.' });
      return res.status(200).json(await writeAll(redis, next));
    }

    // Importar: { items: [...], mode: "merge" | "replace" }
    if (req.method === 'PUT') {
      const { items, mode } = readBody(req);
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'El JSON tiene que ser una lista de clausulazos: [ {...}, {...} ].' });
      }
      const normalized = [];
      const problems = [];
      items.forEach((item, i) => {
        const { value, errors } = normalizeClausulazo(item);
        if (errors.length) problems.push(`Fila ${i + 1}: ${errors.join(' ')}`);
        else normalized.push(value);
      });
      if (problems.length) return res.status(400).json({ error: problems.slice(0, 5).join('\n') });

      let next;
      if (mode === 'replace') {
        next = normalized;
      } else {
        const byId = new Map((await readAll(redis)).map((c) => [c.id, c]));
        normalized.forEach((c) => byId.set(c.id, c));
        next = [...byId.values()];
      }
      return res.status(200).json(await writeAll(redis, next));
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Error inesperado en el servidor.' });
  }
}
