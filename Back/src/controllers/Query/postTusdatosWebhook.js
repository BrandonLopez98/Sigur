const crypto = require('crypto')
const { Query } = require('../../db')
const { synchronizeTusdatosQuery } = require('../../services/tusdatosQueryLifecycle')

function isAuthorized(req) {
  const expectedToken = process.env.TUSDATOS_WEBHOOK_TOKEN
  const receivedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!expectedToken || !receivedToken) return false

  const expected = Buffer.from(expectedToken)
  const received = Buffer.from(receivedToken)

  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}

/**
 * Recibe individualCompleted y asocia el evento por webhook_reference. No se
 * transmiten créditos ni información de billetera al proveedor.
 */
module.exports = async (req, res, next) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Webhook no autorizado.' })
    }

    const {
      event_name: eventName,
      webhook_reference: webhookReference,
      reportId,
      finished_at: finishedAt,
    } = req.body

    if (eventName !== 'individualCompleted') {
      return res.status(200).json({ ignored: true })
    }

    const match = /^verifik-query:([\w-]+)$/.exec(webhookReference || '')

    // /api/launch/car no admite webhook_reference. El monitor persistente
    // terminará esas consultas sin depender de la notificación.
    if (!match) {
      return res.status(200).json({ received: true, matched: false })
    }

    const query = await Query.findByPk(match[1])
    if (!query) {
      return res.status(200).json({ received: true, matched: false })
    }

    const outcome = await synchronizeTusdatosQuery(query.id, {
      reportId,
      finishedAt,
    })

    return res.status(200).json({
      received: true,
      status: outcome.state,
      updated: outcome.state === 'completed',
    })
  } catch (error) {
    return next(error)
  }
}
