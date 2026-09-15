const { UserProfile, conn } = require('../../db')

/**
 * Actualiza o crea el perfil del usuario autenticado.
 *
 * @param {string} userId - ID obtenido desde el token JWT.
 * @param {Object} profileData - Datos que el usuario desea guardar.
 * @returns {Promise<Object>} Perfil actualizado.
 */
module.exports = async (userId, profileData) => {
  const {
    first_name,
    last_name,
    phone,
    birth_date,
  } = profileData

  // Solo actualizamos campos que llegaron en la petición.
  const changes = {}

  if (first_name !== undefined) {
    changes.first_name = first_name?.trim() || null
  }

  if (last_name !== undefined) {
    changes.last_name = last_name?.trim() || null
  }

  if (phone !== undefined) {
    changes.phone = phone?.trim() || null
  }

  if (birth_date !== undefined) {
    changes.birth_date = birth_date || null
  }

  if (Object.keys(changes).length === 0) {
    const error = new Error('Envía al menos un dato para actualizar el perfil.')
    error.status = 400
    throw error
  }

  return conn.transaction(async (transaction) => {
    // Si no hay perfil, lo crea; si existe, lo actualiza.
    const [profile, created] = await UserProfile.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        ...changes,
      },
      transaction,
    })

    if (!created) {
      await profile.update(changes, { transaction })
    }

    return profile
  })
}