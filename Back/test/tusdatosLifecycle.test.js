const test = require('node:test')
const assert = require('node:assert/strict')

const dbPath = require.resolve('../src/db')
const apiPath = require.resolve('../src/services/tusdatosApi')
const refundPath = require.resolve('../src/services/refundQueryCredit')
const lifecyclePath = require.resolve('../src/services/tusdatosQueryLifecycle')

function createQuery(values = {}) {
  return {
    id: 'query-1',
    status: 'processing',
    provider_request_id: null,
    provider_report_id: null,
    provider_response: null,
    provider_poll_attempts: 0,
    provider_started_at: new Date(),
    created_at: new Date(),
    completed_at: null,
    search_name: null,
    ...values,
    async update(updateValues) {
      Object.assign(this, updateValues)
      return this
    },
  }
}

function loadLifecycle({ query, apiOverrides = {}, refundImplementation } = {}) {
  const previous = new Map([
    [dbPath, require.cache[dbPath]],
    [apiPath, require.cache[apiPath]],
    [refundPath, require.cache[refundPath]],
    [lifecyclePath, require.cache[lifecyclePath]],
  ])
  const api = {
    async getTusdatosQueryResult() { return { estado: 'procesando' } },
    async getTusdatosReportJson() { return { hallazgos: 'bajo', source_config: {} } },
    hasTusdatosConfiguration() { return true },
    isTerminalTusdatosError(error) { return [404, 500].includes(error?.status) },
    ...apiOverrides,
  }
  const refund = refundImplementation || (async () => ({ query, refunded: true }))

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
      Query: {
        async findByPk() { return query },
        async findAll() { return [] },
        async update() { return [1] },
      },
    },
  }
  require.cache[apiPath] = { id: apiPath, filename: apiPath, loaded: true, exports: api }
  require.cache[refundPath] = {
    id: refundPath,
    filename: refundPath,
    loaded: true,
    exports: { refundQueryCredit: refund },
  }
  delete require.cache[lifecyclePath]
  const lifecycle = require(lifecyclePath)

  return {
    lifecycle,
    cleanup() {
      for (const [path, cached] of previous) {
        if (cached) require.cache[path] = cached
        else delete require.cache[path]
      }
    },
  }
}

test('registra un lanzamiento nuevo y agenda su primer seguimiento', async () => {
  const query = createQuery({ status: 'pending' })
  const loaded = loadLifecycle({ query })

  try {
    const outcome = await loaded.lifecycle.registerTusdatosLaunchResponse(query, {
      jobid: 'job-1',
      estado: 'procesando',
    })

    assert.equal(outcome.state, 'processing')
    assert.equal(query.provider_request_id, 'job-1')
    assert.equal(query.status, 'processing')
    assert.ok(query.provider_next_poll_at instanceof Date)
  } finally {
    loaded.cleanup()
  }
})

test('completa inmediatamente un reporte reutilizado', async () => {
  const query = createQuery({ status: 'pending' })
  const loaded = loadLifecycle({
    query,
    apiOverrides: {
      async getTusdatosReportJson() {
        return {
          nombre: 'Persona verificada',
          hallazgos: 'medio',
          source_config: { listas: true },
          dict_hallazgos: { medios: [{}] },
        }
      },
    },
  })

  try {
    const outcome = await loaded.lifecycle.registerTusdatosLaunchResponse(query, {
      id: 'report-1',
      error: 'Documento consultado previamente',
    })

    assert.equal(outcome.state, 'completed')
    assert.equal(query.provider_report_id, 'report-1')
    assert.equal(query.risk_level, 'medium')
    assert.equal(query.provider_response.report.nombre, 'Persona verificada')
  } finally {
    loaded.cleanup()
  }
})

test('el webhook completa por reportId aunque no exista jobid', async () => {
  const query = createQuery({ status: 'processing' })
  const loaded = loadLifecycle({ query })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id, {
      reportId: 'report-from-webhook',
      finishedAt: '2026-09-27T22:00:00Z',
    })

    assert.equal(outcome.state, 'completed')
    assert.equal(query.provider_report_id, 'report-from-webhook')
  } finally {
    loaded.cleanup()
  }
})

test('un error transitorio mantiene la consulta y agenda backoff', async () => {
  const query = createQuery({ provider_request_id: 'job-1' })
  const loaded = loadLifecycle({
    query,
    apiOverrides: {
      async getTusdatosQueryResult() {
        const error = new Error('temporal')
        error.status = 503
        throw error
      },
    },
  })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id)
    assert.equal(outcome.state, 'retrying')
    assert.equal(query.status, 'processing')
    assert.equal(query.provider_poll_attempts, 1)
    assert.ok(query.provider_next_poll_at instanceof Date)
  } finally {
    loaded.cleanup()
  }
})

test('un error terminal falla y reintegra una sola vez', async () => {
  const query = createQuery({ provider_request_id: 'job-1' })
  let refunds = 0
  const loaded = loadLifecycle({
    query,
    apiOverrides: {
      async getTusdatosQueryResult() {
        const error = new Error('trabajo no encontrado')
        error.status = 404
        throw error
      },
    },
    refundImplementation: async () => {
      refunds += 1
      query.status = 'failed'
      return { query, refunded: true }
    },
  })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id)
    assert.equal(outcome.state, 'failed')
    assert.equal(outcome.refunded, true)
    assert.equal(refunds, 1)
  } finally {
    loaded.cleanup()
  }
})

test('un evento duplicado sobre una consulta terminada no vuelve a consultar ni reintegrar', async () => {
  const query = createQuery({ status: 'completed', provider_report_id: 'report-1' })
  let providerCalls = 0
  let refunds = 0
  const loaded = loadLifecycle({
    query,
    apiOverrides: {
      async getTusdatosQueryResult() { providerCalls += 1 },
      async getTusdatosReportJson() { providerCalls += 1 },
    },
    refundImplementation: async () => { refunds += 1 },
  })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id, {
      reportId: 'report-1',
    })
    assert.equal(outcome.state, 'completed')
    assert.equal(providerCalls, 0)
    assert.equal(refunds, 0)
  } finally {
    loaded.cleanup()
  }
})

test('una consulta huérfana antigua falla y solicita reintegro', async () => {
  const query = createQuery({
    provider_request_id: null,
    provider_started_at: new Date(Date.now() - 10 * 60 * 1000),
  })
  let refunds = 0
  const loaded = loadLifecycle({
    query,
    refundImplementation: async () => {
      refunds += 1
      query.status = 'failed'
      return { query, refunded: true }
    },
  })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id)
    assert.equal(outcome.state, 'failed')
    assert.equal(refunds, 1)
  } finally {
    loaded.cleanup()
  }
})

test('el límite de intentos detiene el polling y solicita reintegro', async () => {
  const query = createQuery({
    provider_request_id: 'job-1',
    provider_poll_attempts: 240,
  })
  let refunds = 0
  const loaded = loadLifecycle({
    query,
    refundImplementation: async () => {
      refunds += 1
      query.status = 'failed'
      return { query, refunded: true }
    },
  })

  try {
    const outcome = await loaded.lifecycle.synchronizeTusdatosQuery(query.id)
    assert.equal(outcome.state, 'failed')
    assert.equal(refunds, 1)
  } finally {
    loaded.cleanup()
  }
})
