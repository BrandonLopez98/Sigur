const API_URL = import.meta.env.VITE_API_URL

function createRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

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
      'X-Request-Id': createRequestId(),
    },
    body: JSON.stringify(queryData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible crear la consulta.')
  }

  return data
}

/** Obtiene el resultado detallado de una consulta propia ya finalizada. */
export async function getQueryResult(token, queryId) {
  const response = await fetch(`${API_URL}/Query/${queryId}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible cargar el resultado.')
  }

  return data
}

/** Fuerza una sincronización de estado sin crear ni cobrar otra consulta. */
export async function refreshQueryStatus(token, queryId) {
  const response = await fetch(`${API_URL}/Query/${queryId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok && response.status !== 202) {
    throw new Error(data.error || 'No fue posible actualizar el estado.')
  }

  return data
}

/** Actualiza fuentes fallidas de una consulta finalizada sin crear otra consulta. */
export async function retryFailedQuerySources(token, queryId) {
  const response = await fetch(`${API_URL}/Query/${queryId}/retry`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible actualizar las fuentes con falla.')
  }

  return data
}
