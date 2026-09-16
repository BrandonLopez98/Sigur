const API_URL = import.meta.env.VITE_API_URL

/**
 * Obtiene las consultas del usuario autenticado.
 *
 * @param {string} token - JWT obtenido al iniciar sesión.
 * @param {Object} filters - Filtros opcionales.
 */
export async function getQueries(token, filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = `${API_URL}/Query${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudieron cargar las consultas.');
  }

  return data;
}

export async function createQuery(token, queryData) {
  const response = await fetch(`${API_URL}/Query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible crear la consulta.')
  }

  return data
}
