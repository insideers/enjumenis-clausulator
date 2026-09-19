import { getRedis, readCronicas, writeCronicas, checkAdmin, readBody } from './_lib/store.js';
import { normalizeCronica } from '../shared/validate.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      return res.status(200).json(await readCronicas(redis));
    }

    const auth = checkAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    // Publicar o actualizar la crónica de una jornada
    if (req.method === 'PUT') {
      const { value, errors } = normalizeCronica(readBody(req));
      if (errors.length) return res.status(400).json({ error: errors.slice(0, 5).join('\n') });
      const list = (await readCronicas(redis)).filter((c) => c.jornada !== value.jornada);
      return res.status(200).json(await writeCronicas(redis, [...list, value]));
    }

    // Borrar la crónica de una jornada: DELETE /api/cronicas?jornada=7
    if (req.method === 'DELETE') {
      const jornada = Number.parseInt(req.query?.jornada, 10);
      const list = await readCronicas(redis);
      const next = list.filter((c) => c.jornada !== jornada);
      if (next.length === list.length) return res.status(404).json({ error: 'No hay crónica de esa jornada.' });
      return res.status(200).json(await writeCronicas(redis, next));
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Error inesperado en el servidor.' });
  }
}
