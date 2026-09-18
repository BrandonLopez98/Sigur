const API_URL = import.meta.env.VITE_API_URL

/**
 * Obtiene el historial de compras del usuario autenticado.
 *
 * @param {string} token - JWT de la sesión activa.
 * @returns {Promise<{total: number, transactions: Array}>}
 */
export async function getMyPaymentTransactions(token) {
  const response = await fetch(`${API_URL}/Payments/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || 'No fue posible cargar las transacciones.'
    )
  }

  return data
}