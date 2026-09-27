const test = require('node:test')
const assert = require('node:assert/strict')
const { createRefundQueryCredit } = require('../src/services/refundQueryCredit')

test('reintegra el crédito una sola vez ante eventos duplicados', async () => {
  const movements = []
  const query = {
    id: 'query-1',
    user_id: 'user-1',
    status: 'processing',
    document_type: 'CC',
    document_number: 'redacted',
    credit_charged_at: new Date(),
    credit_refunded_at: null,
    async update(values) { Object.assign(this, values) },
  }
  const transaction = { LOCK: { UPDATE: 'UPDATE' } }
  const refund = createRefundQueryCredit({
    QueryModel: { async findByPk() { return query } },
    connection: { async transaction(callback) { return callback(transaction) } },
    applyMovement: async (movement) => { movements.push(movement) },
  })

  const first = await refund({ queryId: query.id, reason: 'provider error' })
  const second = await refund({ queryId: query.id, reason: 'duplicate webhook' })

  assert.equal(first.refunded, true)
  assert.equal(second.refunded, false)
  assert.equal(movements.length, 1)
  assert.equal(movements[0].amount, 1)
})
