const test = require('node:test')
const assert = require('node:assert/strict')
const { sanitize } = require('../src/services/observability')

test('elimina secretos y datos de documentos de los logs estructurados', () => {
  const safe = sanitize({
    query_id: 'query-1',
    authorization: 'Bearer secret',
    document_number: '123456',
    nested: { token: 'secret', status: 'processing' },
  })

  assert.deepEqual(safe, {
    query_id: 'query-1',
    nested: { status: 'processing' },
  })
})

test('conserva fechas como ISO para que los logs sean accionables', () => {
  assert.deepEqual(
    sanitize({ next_poll_at: new Date('2026-09-27T22:00:00Z') }),
    { next_poll_at: '2026-09-27T22:00:00.000Z' }
  )
})
