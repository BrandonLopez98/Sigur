const API_URL = import.meta.env.VITE_API_URL

/**
 * Crea una transacción pendiente y obtiene la configuración
 * necesaria para abrir el Checkout Web de Wompi.
 *
 * @param {string} token - JWT del usuario autenticado.
 * @param {string} packageId - Identificador del paquete elegido.
 * @returns {Promise<Object>}
 */
export async function createPaymentCheckout(token, packageId) {
  const response = await fetch(`${API_URL}/Payments/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      package_id: packageId,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible iniciar el pago.')
  }

  return data
}