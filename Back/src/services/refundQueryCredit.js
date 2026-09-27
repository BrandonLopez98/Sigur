const { Query, conn } = require('../db')
const { applyCreditMovement } = require('./creditMovements')
const { incrementMetric, logEvent } = require('./observability')

/**
 * Marca una consulta como fallida y reintegra su crédito una sola vez.
 * Puede ser llamado desde el lanzamiento, el polling o un webhook de Tusdatos.
 */
function createRefundQueryCredit({
  QueryModel = Query,
  connection = conn,
  applyMovement = applyCreditMovement,
} = {}) {
  return async function refundQueryCreditImplementation({ queryId, reason, providerResponse = null }) {
    return connection.transaction(async (transaction) => {
      const query = await QueryModel.findByPk(queryId, {
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
        incrementMetric('query_refund_skipped')
        return { query, refunded: false }
      }

      await applyMovement({
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

      incrementMetric('query_refunded')
      logEvent('info', 'query.credit_refunded', {
        query_id: query.id,
        user_id: query.user_id,
        status: 'failed',
      })

      return { query, refunded: true }
    })
  }
}

const refundQueryCredit = createRefundQueryCredit()

module.exports = { createRefundQueryCredit, refundQueryCredit }
