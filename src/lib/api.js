import { SEED } from '../../shared/seed.js';

const PW_KEY = 'clausoremeter-delegado';

export const savedPassword = {
  get: () => {
    try {
      return sessionStorage.getItem(PW_KEY) || '';
    } catch {
      return '';
    }
  },
  set: (pw) => {
    try {
      if (pw) sessionStorage.setItem(PW_KEY, pw);
      else sessionStorage.removeItem(PW_KEY);
    } catch {
      /* navegador sin sessionStorage: se pide la contraseña cada vez */
    }
  },
};

async function request(path, { method = 'GET', password, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (password) headers['x-admin-password'] = encodeURIComponent(password);

  const res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (!isJson) {
    const err = new Error(
      res.status === 404
        ? 'No se encuentra la API (/api/clausulazos). Revisa que la carpeta api esté en la raíz del repo.'
        : `La API ha fallado (error ${res.status}). Mira el detalle en Vercel, en la pestaña Logs.`
    );
    err.offline = true;
    throw err;
  }
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function loadClausulazos() {
  try {
    const data = await request('/api/clausulazos');
    return { data, online: true, message: '' };
  } catch (err) {
    return { data: SEED, online: false, message: err.message };
  }
}

export async function loadCronicas() {
  try {
    return await request('/api/cronicas');
  } catch {
    return [];
  }
}

export const saveCronica = (password, cronica) => request('/api/cronicas', { method: 'PUT', password, body: cronica });
export const deleteCronica = (password, jornada) =>
  request(`/api/cronicas?jornada=${encodeURIComponent(jornada)}`, { method: 'DELETE', password });

export const checkPassword = (password) => request('/api/auth', { method: 'POST', password, body: {} });
export const addClausulazo = (password, item) => request('/api/clausulazos', { method: 'POST', password, body: item });
export const deleteClausulazo = (password, id) =>
  request(`/api/clausulazos?id=${encodeURIComponent(id)}`, { method: 'DELETE', password });
export const importClausulazos = (password, items, mode) =>
  request('/api/clausulazos', { method: 'PUT', password, body: { items, mode } });
