const API_URL = import.meta.env.VITE_API_URL

/**
 * Obtiene la información común del servicio y los paquetes activos.
 *
 * @returns {Promise<{service: Object, packages: Array}>}
 */
export async function getPackages() {
  const response = await fetch(`${API_URL}/Packages`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible cargar los paquetes.')
  }

  return data
}