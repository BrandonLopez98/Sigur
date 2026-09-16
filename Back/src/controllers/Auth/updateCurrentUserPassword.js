const bcrypt = require('bcryptjs')
const { User } = require('../../db')

/**
 * Cambia la contraseña del usuario que está autenticado.
 *
 * Requiere la contraseña actual para impedir que alguien con una sesión
 * abierta cambie la contraseña sin conocerla.
 */
async function updateCurrentUserPassword(userId, passwordData) {
  const { current_password, new_password } = passwordData

  if (!current_password || !new_password) {
    const error = new Error(
      'Envía la contraseña actual y la nueva contraseña.'
    )
    error.status = 400
    throw error
  }

  if (new_password.length < 8) {
    const error = new Error(
      'La nueva contraseña debe tener al menos 8 caracteres.'
    )
    error.status = 400
    throw error
  }

  if (current_password === new_password) {
    const error = new Error(
      'La nueva contraseña debe ser diferente a la actual.'
    )
    error.status = 400
    throw error
  }

  const user = await User.findByPk(userId)

  if (!user) {
    const error = new Error('Usuario no encontrado.')
    error.status = 404
    throw error
  }

  const passwordMatches = await bcrypt.compare(
    current_password,
    user.password_hash
  )

  if (!passwordMatches) {
    const error = new Error('La contraseña actual es incorrecta.')
    error.status = 401
    throw error
  }

  const hashedPassword = await bcrypt.hash(new_password, 10)

  await user.update({
    password_hash: hashedPassword,
  })

  return {
    message: 'Contraseña actualizada correctamente.',
  }
}

module.exports = updateCurrentUserPassword