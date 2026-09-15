const { User, UserProfile, CreditWallet } = require('../../db')

/**
 * Obtiene los datos seguros del usuario autenticado.
 */
module.exports = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ['password_hash'],
    },
    include: [
      {
        model: UserProfile,
        as: 'profile',
        required: false,
      },
      {
        model: CreditWallet,
        as: 'wallet',
        required: false,
      },
    ],
  })

  if (!user) {
    const error = new Error('Usuario no encontrado.')
    error.status = 404
    throw error
  }

  return user
}