const test = require('node:test')
const assert = require('node:assert/strict')
const {
  findRecentDuplicateQuery,
  markAsIdempotentReplay,
} = require('../src/services/queryIdempotency')

test('busca una consulta idéntica dentro de la misma transacción', async () => {
  let receivedOptions
  const existing = { id: 'query-1' }
  const Query = {
    async findOne(options) {
      receivedOptions = options
      return existing
    },
  }
  const transaction = { id: 'transaction-1' }
  const result = await findRecentDuplicateQuery({
    Query,
    userId: 'user-1',
    data: {
      type: 'CC',
      number: '123',
      ownerDocumentType: null,
      ownerDocumentNumber: null,
    },
    transaction,
    now: new Date('2026-09-27T22:00:00Z'),
  })

  assert.equal(result, existing)
  assert.equal(receivedOptions.transaction, transaction)
  assert.equal(receivedOptions.where.user_id, 'user-1')
  assert.equal(receivedOptions.where.document_number, '123')
})

test('marca la respuesta reutilizada para que la API informe idempotencia', () => {
  const data = {}
  const query = { setDataValue(key, value) { data[key] = value } }
  markAsIdempotentReplay(query)
  assert.equal(data.idempotent_replay, true)
})
