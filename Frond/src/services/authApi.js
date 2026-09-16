// URL base del backend.
const API_URL = import.meta.env.VITE_API_URL

/**
 * Envía las credenciales al backend e inicia sesión.
 *
 * @param {Object} credentials
 * @param {string} credentials.email - Correo escrito por el usuario.
 * @param {string} credentials.password - Contraseña escrita por el usuario.
 * @returns {Promise<Object>} Token JWT y datos seguros del usuario.
 */
export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  // Muestra el mensaje que envía el backend si el login falla.
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible iniciar sesión.');
  }

  return data;
}
