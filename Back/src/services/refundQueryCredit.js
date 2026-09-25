const { Query, conn } = require('../db')
const { applyCreditMovement } = require('./creditMovements')

/**
 * Marca una consulta como fallida y reintegra su crédito una sola vez.
 * Puede ser llamado desde el lanzamiento, el polling o un webhook de Tusdatos.
 */
async function refundQueryCredit({ queryId, reason, providerResponse = null }) {
  return conn.transaction(async (transaction) => {
    const query = await Query.findByPk(queryId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })

    if (!query) {
      throw new Error('Consulta no encontrada para reintegro.')
    }

    if (query.status === 'completed') {
      return { query, refunded: false }
    }

    const updateValues = {
      status: 'failed',
      provider_error: reason,
    }

    if (providerResponse) {
      updateValues.provider_response = providerResponse
    }

    if (!query.credit_charged_at || query.credit_refunded_at) {
      await query.update(updateValues, { transaction })
      return { query, refunded: false }
    }

    await applyCreditMovement({
      transaction,
      userId: query.user_id,
      type: 'query_refund',
      amount: 1,
      sourceType: 'query',
      sourceId: query.id,
      reference: query.id,
      description: 'Crédito reintegrado porque la consulta no pudo completarse.',
      metadata: {
        document_type: query.document_type,
        document_number: query.document_number,
        provider_error: reason,
      },
    })

    await query.update(
      {
        ...updateValues,
        credit_refunded_at: new Date(),
      },
      { transaction }
    )

    return { query, refunded: true }
  })
}

module.exports = { refundQueryCredit }
