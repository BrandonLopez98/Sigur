// URL base donde está ejecutándose el backend.
const API_URL = 'http://localhost:3001'

/**
 * Obtiene las consultas de un usuario desde el backend.
 *
 * El usuario se envía por header y los filtros se agregan
 * como parámetros en la URL.
 *
 * @param {string} userId - ID del usuario que consulta el historial.
 * @param {Object} filters - Filtros opcionales, por ejemplo: status o risk_level.
 * @returns {Promise<Array>} Lista de consultas encontradas.
 */
export async function getQueries(userId, filters = {}) {
  // Convierte los filtros recibidos a query params.
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    // Evita enviar filtros vacíos.
    if (value) {
      params.append(key, value)
    }
  })

  // Solo agrega "?" cuando hay filtros activos.
  const queryString = params.toString()
  const url = `${API_URL}/Query${queryString ? `?${queryString}` : ''}`

  // Realiza la petición y manda el user_id por headers.
  const response = await fetch(url, {
    headers: {
      user_id: userId,
    },
  })

  // Detiene el flujo si el backend devuelve un error.
  if (!response.ok) {
    throw new Error('No se pudieron cargar las consultas')
  }

  // Convierte la respuesta JSON en un arreglo de consultas.
  return response.json()
}