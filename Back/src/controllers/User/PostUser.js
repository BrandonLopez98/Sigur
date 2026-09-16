const bcrypt = require('bcryptjs')
const { User, CreditWallet, conn } = require('../../db')

const SALT_ROUNDS = 12

/**
 * Registra un usuario y crea su billetera con saldo inicial en cero.
 */
module.exports = async ({ email, password, status, role }) => {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    throw new Error('El correo electrónico y la contraseña son obligatorios.')
  }

  return conn.transaction(async (transaction) => {
    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction,
    })

    if (existingUser) {
      throw new Error('Ya existe un usuario con este correo.')
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await User.create(
      {
        email: normalizedEmail,
        password_hash: passwordHash,
        status,
        role,
      },
      { transaction }
    )

    // Toda cuenta nueva empieza sin créditos.
    await CreditWallet.create(
      {
        user_id: user.id,
        balance: 0,
      },
      { transaction }
    )

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
    }
  })
}