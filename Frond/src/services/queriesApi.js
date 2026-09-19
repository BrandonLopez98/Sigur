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

/** Descarga el PDF autenticado sin exponer enlaces del proveedor en el navegador. */
export async function downloadQueryReportPdf(token, queryId) {
  const response = await fetch(`${API_URL}/Query/${queryId}/report/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'No fue posible descargar el PDF.')
  }

  const file = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') || ''
  const fileName = /filename="?([^";]+)"?/i.exec(contentDisposition)?.[1]
    || `reporte-verifik-${queryId}.pdf`
  const fileUrl = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(fileUrl)
}
