const API_URL = import.meta.env.VITE_API_URL

/**
 * Obtiene la información completa del usuario autenticado:
 * usuario, perfil y billetera.
 *
 * @param {string} token - JWT guardado al iniciar sesión.
 * @returns {Promise<Object>} Usuario autenticado.
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/Auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible obtener tu información.')
  }

  return data
}

/**
 * Guarda cambios del perfil del usuario autenticado.
 *
 * @param {string} token - JWT guardado al iniciar sesión.
 * @param {Object} profileData - Datos del perfil a actualizar.
 * @returns {Promise<Object>} Perfil actualizado.
 */
export async function updateCurrentUserProfile(token, profileData) {
  const response = await fetch(`${API_URL}/Auth/me/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible actualizar tu perfil.')
  }

  return data
}

/**
 * Envía al backend la contraseña actual y la nueva contraseña.
 */
export async function updateCurrentUserPassword(token, passwordData) {
  const response = await fetch(`${API_URL}/Auth/me/password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible cambiar la contraseña.')
  }

  return data
}
