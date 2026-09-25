const API_URL = import.meta.env.VITE_API_URL

/** Obtiene el libro contable de créditos del usuario autenticado. */
export async function getCreditMovements(token, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_URL}/Credits/movements?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible cargar los movimientos.')
  }

  return data
}
