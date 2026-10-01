const { User } = require('../../db')

const SAFE_USER_ATTRIBUTES = {
  exclude: ['password_hash', 'google_id'],
}

module.exports = async (email) => {
  // Esta función solo se expone detrás del rol administrador. Además, la
  // selección explícita evita filtrar credenciales incluso si se reutiliza.
  if (email) {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({
      where: { email: normalizedEmail },
      attributes: SAFE_USER_ATTRIBUTES,
    })

    if (!user) {
      const error = new Error('Usuario no encontrado.')
      error.status = 404
      throw error
    }

    return user
  }

  return User.findAll({
    attributes: SAFE_USER_ATTRIBUTES,
    order: [['created_at', 'DESC']],
  })
}
