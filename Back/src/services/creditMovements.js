const { CreditWallet, CreditMovement } = require('../db')

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function validateMovement(type, amount) {
  if (!Number.isInteger(amount) || amount === 0) {
    throw createHttpError(
      'El movimiento de créditos debe ser un número entero diferente de cero.',
      400
    )
  }

  if (type === 'purchase' && amount < 0) {
    throw createHttpError('Una compra debe sumar créditos.', 400)
  }

  if (type === 'query_charge' && amount > 0) {
    throw createHttpError('El cobro de una consulta debe restar créditos.', 400)
  }

  if (type === 'query_refund' && amount < 0) {
    throw createHttpError('El reintegro debe sumar créditos.', 400)
  }
}

/**
 * Actualiza la billetera y registra el movimiento dentro de la misma
 * transacción de base de datos.
 */
async function applyCreditMovement({
  transaction,
  userId,
  type,
  amount,
  sourceType,
  sourceId = null,
  reference = null,
  description,
  metadata = null,
}) {
  if (!transaction) {
    throw createHttpError(
      'El movimiento de créditos requiere una transacción de base de datos.',
      500
    )
  }

  validateMovement(type, amount)

  const wallet = await CreditWallet.findOne({
    where: { user_id: userId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  })

  if (!wallet) {
    throw createHttpError('No se encontró la billetera del usuario.', 404)
  }

  const newBalance = Number(wallet.balance) + amount

  if (newBalance < 0) {
    throw createHttpError(
      'No tienes créditos disponibles para realizar esta operación.',
      402
    )
  }

  wallet.balance = newBalance
  await wallet.save({ transaction })

  const movement = await CreditMovement.create(
    {
      user_id: userId,
      type,
      amount,
      balance_after: newBalance,
      source_type: sourceType,
      source_id: sourceId,
      reference,
      description,
      metadata,
    },
    { transaction }
  )

  return {
    wallet,
    movement,
  }
}

module.exports = {
  applyCreditMovement,
}