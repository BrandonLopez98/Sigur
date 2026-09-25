const crypto = require('crypto')
const {
  conn,
  PaymentTransaction,
} = require('../../db')
const { applyCreditMovement } = require('../../services/creditMovements')

/**
 * Obtiene un valor anidado usando una ruta como "transaction.status".
 */
function getNestedValue(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object)
}

/**
 * Compara dos firmas sin revelar información sobre su contenido.
 */
function hasSameChecksum(receivedChecksum, expectedChecksum) {
  const receivedBuffer = Buffer.from(receivedChecksum, 'utf8')
  const expectedBuffer = Buffer.from(expectedChecksum, 'utf8')

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

/**
 * Recibe y valida los eventos transaction.updated enviados por Wompi.
 * Los créditos se suman una sola vez cuando el pago llega como APPROVED.
 */
async function postWompiWebhook(req, res, next) {
  try {
    const eventData = req.body

    if (eventData.event !== 'transaction.updated') {
      return res.status(200).json({
        message: 'Evento ignorado.',
      })
    }

    if (!process.env.WOMPI_EVENTS_SECRET) {
      return res.status(500).json({
        error: 'WOMPI_EVENTS_SECRET no está configurado.',
      })
    }

    const properties = eventData.signature?.properties
    const receivedChecksum = eventData.signature?.checksum
    const timestamp = eventData.timestamp
    const wompiTransaction = eventData.data?.transaction

    if (
      !Array.isArray(properties) ||
      !receivedChecksum ||
      !timestamp ||
      !wompiTransaction
    ) {
      return res.status(400).json({
        error: 'El evento de Wompi no tiene la estructura esperada.',
      })
    }

    const signatureValues = properties.map((property) => {
      const value = getNestedValue(eventData.data, property)

      if (value === undefined) {
        throw new Error(`No se encontró la propiedad ${property} en el evento.`)
      }

      return String(value)
    })

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(
        `${signatureValues.join('')}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`
      )
      .digest('hex')

    if (
      !hasSameChecksum(
        receivedChecksum.toLowerCase(),
        expectedChecksum.toLowerCase()
      )
    ) {
      return res.status(401).json({
        error: 'La firma del evento de Wompi no es válida.',
      })
    }

    const result = await conn.transaction(async (databaseTransaction) => {
      const paymentTransaction = await PaymentTransaction.findOne({
        where: {
          reference: wompiTransaction.reference,
        },
        transaction: databaseTransaction,
        lock: databaseTransaction.LOCK.UPDATE,
      })

      // Un pago que no pertenece a Verifik no modifica nada.
      if (!paymentTransaction) {
        return {
          message: 'Transacción no encontrada en Verifik. Evento ignorado.',
        }
      }

      const expectedAmountInCents = Math.round(
        Number(paymentTransaction.amount_paid) * 100
      )

      if (
        Number(wompiTransaction.amount_in_cents) !== expectedAmountInCents ||
        wompiTransaction.currency !== paymentTransaction.currency
      ) {
        const error = new Error(
          'El monto o la moneda confirmados por Wompi no coinciden.'
        )
        error.status = 400
        throw error
      }

      paymentTransaction.wompi_transaction_id = wompiTransaction.id
      paymentTransaction.status = wompiTransaction.status
      paymentTransaction.payment_method =
        wompiTransaction.payment_method_type || null

      if (
          wompiTransaction.status === 'APPROVED' &&
          !paymentTransaction.credited_at
        ) {
          await applyCreditMovement({
            transaction: databaseTransaction,
            userId: paymentTransaction.user_id,
            type: 'purchase',
            amount: paymentTransaction.credits_amount,
            sourceType: 'payment',
            sourceId: paymentTransaction.id,
            reference: paymentTransaction.reference,
            description: `Compra aprobada de ${paymentTransaction.credits_amount} créditos.`,
            metadata: {
              wompi_transaction_id: wompiTransaction.id,
              payment_method: wompiTransaction.payment_method_type || null,
            },
          })

          paymentTransaction.credited_at = new Date()
        }

      await paymentTransaction.save({
        transaction: databaseTransaction,
      })

      return {
        message: 'Evento de Wompi procesado correctamente.',
        status: paymentTransaction.status,
        creditsAdded:
          wompiTransaction.status === 'APPROVED' &&
          paymentTransaction.credited_at
            ? paymentTransaction.credits_amount
            : 0,
      }
    })

    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = postWompiWebhook