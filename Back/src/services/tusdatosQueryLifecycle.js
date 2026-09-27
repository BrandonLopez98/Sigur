const { Op } = require('sequelize')
const { Query } = require('../db')
const {
  getTusdatosQueryResult,
  getTusdatosReportJson,
  hasTusdatosConfiguration,
  isTerminalTusdatosError,
} = require('./tusdatosApi')
const { refundQueryCredit } = require('./refundQueryCredit')
const {
  classifyTusdatosLaunchResponse,
  getStoredTusdatosReportId,
  normalizeProviderStatus,
} = require('./tusdatosResponse')
const { buildResultSummary, getRiskLevel } = require('./tusdatosReport')
const {
  getMaxPollAttempts,
  getMonitorLeaseMs,
  getPollBackoffMs,
} = require('./tusdatosBackoff')
const { incrementMetric, logEvent } = require('./observability')

const INITIAL_DELAY_MS = Number(process.env.TUSDATOS_POLL_INITIAL_DELAY_MS || 60000)
const POLL_INTERVAL_MS = Number(process.env.TUSDATOS_POLL_INTERVAL_MS || 5000)
const JOB_TIMEOUT_MS = Number(process.env.TUSDATOS_JOB_TIMEOUT_MS || 6900000)
const LAUNCH_RECOVERY_TIMEOUT_MS = Number(
  process.env.TUSDATOS_LAUNCH_RECOVERY_TIMEOUT_MS || 120000
)
const MONITOR_ENABLED = process.env.TUSDATOS_QUERY_MONITOR_ENABLED !== 'false'
const inFlightQueries = new Set()
let monitorId = null
let monitorRunning = false

function getNextPollDate(attempt, now = new Date()) {
  return new Date(now.getTime() + getPollBackoffMs(attempt))
}

async function completeQuery(query, result, { reportId, finishedAt } = {}) {
  const finalReportId = reportId || result.id || query.provider_report_id
  let reportJson = query.provider_response?.report || null

  if (finalReportId && !reportJson) {
    try {
      reportJson = await getTusdatosReportJson(finalReportId)
    } catch (error) {
      // El resultado ya terminó aunque el JSON detallado pueda publicarse unos
      // segundos después. No mantenemos la consulta bloqueada por ese motivo.
      incrementMetric('provider_report_pending')
      logEvent('warn', 'query.report_not_ready', {
        query_id: query.id,
        error,
      })
    }
  }

  const resultForPresentation = reportJson || result

  await query.update({
    status: 'completed',
    risk_level: getRiskLevel(resultForPresentation),
    search_name: resultForPresentation.nombre || result.nombre || query.search_name,
    provider_report_id: finalReportId,
    provider_response: { result, report: reportJson },
    result_summary: buildResultSummary(resultForPresentation, {
      reportId: finalReportId,
      finishedAt,
    }),
    provider_error: null,
    provider_last_polled_at: new Date(),
    provider_next_poll_at: null,
    completed_at: query.completed_at || new Date(),
  })

  incrementMetric('query_completed')
  logEvent('info', 'query.completed', {
    query_id: query.id,
    status: 'completed',
    risk_level: query.risk_level,
    poll_attempts: query.provider_poll_attempts,
    has_report_id: Boolean(finalReportId),
  })

  return query
}

/** Registra de forma exhaustiva la respuesta inicial de Tusdatos. */
async function registerTusdatosLaunchResponse(query, providerResponse) {
  const launch = classifyTusdatosLaunchResponse(providerResponse)
  const now = new Date()

  if (launch.kind === 'report_ready') {
    const completedQuery = await completeQuery(query, providerResponse, {
      reportId: launch.reportId,
      finishedAt: now.toISOString(),
    })
    return { state: 'completed', query: completedQuery, result: providerResponse }
  }

  if (launch.kind === 'processing') {
    await query.update({
      status: 'processing',
      provider_request_id: launch.jobId,
      provider_response: providerResponse,
      search_name: providerResponse.nombre || query.search_name,
      provider_poll_attempts: 0,
      provider_last_polled_at: null,
      provider_next_poll_at: new Date(now.getTime() + INITIAL_DELAY_MS),
      provider_started_at: now,
      provider_error: null,
    })

    return { state: 'processing', query, result: providerResponse }
  }

  const error = new Error(
    launch.message || 'Tusdatos no devolvió un jobid ni un identificador de reporte.'
  )
  error.status = 502
  error.providerResponse = providerResponse
  throw error
}

async function markTemporaryState(query, result = null) {
  const nextAttempt = (query.provider_poll_attempts || 0) + 1
  await query.update({
    status: 'processing',
    provider_response: result || query.provider_response,
    provider_last_polled_at: new Date(),
    provider_next_poll_at: getNextPollDate(nextAttempt),
    provider_poll_attempts: nextAttempt,
  })

  incrementMetric('provider_poll_retry')
  logEvent('info', 'query.poll_scheduled', {
    query_id: query.id,
    status: 'processing',
    poll_attempt: nextAttempt,
    next_poll_at: query.provider_next_poll_at,
  })

  return query
}

/**
 * Consulta un trabajo de Tusdatos y persiste solo estados definitivos. Es
 * idempotente: webhook, monitor y consulta manual pueden llamarlo sin duplicar
 * cobros ni reintegros.
 */
async function synchronizeTusdatosQuery(queryId, options = {}) {
  if (inFlightQueries.has(queryId)) {
    return { state: 'already_processing' }
  }

  inFlightQueries.add(queryId)

  try {
    const query = await Query.findByPk(queryId)

    if (!query) return { state: 'missing' }
    if (['completed', 'failed'].includes(query.status)) return { state: query.status, query }

    const storedReportId = options.reportId || getStoredTusdatosReportId(query)

    if (storedReportId) {
      const storedResult = query.provider_response?.result || query.provider_response || {}
      const completedQuery = await completeQuery(query, storedResult, {
        ...options,
        reportId: storedReportId,
      })
      return { state: 'completed', query: completedQuery, result: storedResult }
    }

    const providerStartedAt = query.provider_started_at || query.created_at
    const elapsedMs = Date.now() - new Date(providerStartedAt).getTime()

    if (!query.provider_request_id) {
      if (elapsedMs > LAUNCH_RECOVERY_TIMEOUT_MS) {
        const failed = await refundQueryCredit({
          queryId: query.id,
          reason: 'Tusdatos no devolvió un identificador de seguimiento o reporte.',
          providerResponse: query.provider_response,
        })
        incrementMetric('query_orphan_refund')
        logEvent('warn', 'query.orphan_refunded', {
          query_id: query.id,
          status: 'failed',
          refunded: Boolean(failed.refunded),
        })
        return { state: 'failed', ...failed }
      }

      return { state: 'waiting_launch', query }
    }

    if (elapsedMs > JOB_TIMEOUT_MS) {
      const failed = await refundQueryCredit({
        queryId: query.id,
        reason: 'El tiempo máximo de seguimiento de Tusdatos fue excedido.',
      })
      incrementMetric('query_timeout_refund')
      logEvent('warn', 'query.timeout_refunded', {
        query_id: query.id,
        status: 'failed',
        poll_attempts: query.provider_poll_attempts,
        refunded: Boolean(failed.refunded),
      })
      return { state: 'failed', ...failed }
    }

    if (query.provider_poll_attempts >= getMaxPollAttempts()) {
      const failed = await refundQueryCredit({
        queryId: query.id,
        reason: 'Tusdatos excedió el número máximo de intentos de seguimiento.',
      })
      incrementMetric('query_max_attempts_refund')
      logEvent('warn', 'query.max_attempts_refunded', {
        query_id: query.id,
        status: 'failed',
        poll_attempts: query.provider_poll_attempts,
        refunded: Boolean(failed.refunded),
      })
      return { state: 'failed', ...failed }
    }

    try {
      const result = await getTusdatosQueryResult(query.provider_request_id)
      incrementMetric('provider_poll_success')
      const status = normalizeProviderStatus(result.estado || result.status || result.Estado)

      if (['finalizado', 'finalizada', 'completed', 'complete'].includes(status)) {
        const completedQuery = await completeQuery(query, result, options)
        return { state: 'completed', query: completedQuery, result }
      }

      if (status === 'procesando' || status === 'processing' || !status) {
        const processingQuery = await markTemporaryState(query, result)
        return { state: 'processing', query: processingQuery, result }
      }

      const failed = await refundQueryCredit({
        queryId: query.id,
        reason: result.errores?.join(' ') || result.estado || 'Tusdatos devolvió un estado terminal no reconocido.',
        providerResponse: result,
      })
      incrementMetric('provider_poll_unknown_terminal_status')
      logEvent('warn', 'query.provider_unknown_status', {
        query_id: query.id,
        status: 'failed',
        provider_status: status,
        refunded: Boolean(failed.refunded),
      })
      return { state: 'failed', ...failed, result }
    } catch (error) {
      if (isTerminalTusdatosError(error)) {
        const failed = await refundQueryCredit({
          queryId: query.id,
          reason: error.message,
          providerResponse: error.providerResponse || null,
        })
        incrementMetric('provider_poll_terminal_error')
        logEvent('warn', 'query.provider_terminal_error', {
          query_id: query.id,
          status: 'failed',
          status_code: error.status,
          refunded: Boolean(failed.refunded),
          error,
        })
        return { state: 'failed', ...failed, error }
      }

      incrementMetric('provider_poll_transient_error')
      logEvent('warn', 'query.provider_transient_error', {
        query_id: query.id,
        status: 'processing',
        poll_attempts: query.provider_poll_attempts,
        error,
      })
      const processingQuery = await markTemporaryState(query)
      return { state: 'retrying', query: processingQuery, error }
    }
  } finally {
    inFlightQueries.delete(queryId)
  }
}

async function runTusdatosMonitor() {
  if (!MONITOR_ENABLED || !hasTusdatosConfiguration()) return
  if (monitorRunning) {
    incrementMetric('monitor_overlap_skipped')
    return
  }

  monitorRunning = true

  try {
    const now = new Date()
    const candidates = await Query.findAll({
      where: {
        status: { [Op.in]: ['pending', 'processing'] },
        [Op.or]: [
          { provider_next_poll_at: { [Op.lte]: now } },
          { provider_next_poll_at: null },
        ],
      },
      order: [['created_at', 'ASC']],
      limit: 20,
    })

    for (const query of candidates) {
      const createdAt = new Date(query.created_at).getTime()
      const firstPollAt = createdAt + INITIAL_DELAY_MS
      const nextPollAt = query.provider_next_poll_at
        ? new Date(query.provider_next_poll_at).getTime()
        : firstPollAt

      if (Date.now() < nextPollAt) continue

      // Lease atómico: si varias instancias ven la misma fila, solo una logra
      // mover provider_next_poll_at y consultar al proveedor.
      const claimTime = new Date()
      const leaseUntil = new Date(claimTime.getTime() + getMonitorLeaseMs())
      const [claimed] = await Query.update(
        { provider_next_poll_at: leaseUntil },
        {
          where: {
            id: query.id,
            status: { [Op.in]: ['pending', 'processing'] },
            [Op.or]: [
              { provider_next_poll_at: { [Op.lte]: claimTime } },
              { provider_next_poll_at: null },
            ],
          },
        }
      )

      if (claimed === 1) {
        incrementMetric('monitor_query_claimed')
        await synchronizeTusdatosQuery(query.id)
      } else {
        incrementMetric('monitor_claim_conflict')
      }
    }
  } finally {
    monitorRunning = false
  }
}

function startTusdatosQueryMonitor() {
  if (!MONITOR_ENABLED) {
    console.log('Monitor de Tusdatos desactivado por configuración.')
    return () => undefined
  }

  if (!hasTusdatosConfiguration()) {
    console.warn('Monitor de Tusdatos no iniciado: faltan variables de configuración.')
    return () => undefined
  }

  runTusdatosMonitor().catch((error) => {
    incrementMetric('monitor_run_failure')
    logEvent('error', 'monitor.initial_run_failed', { error })
  })

  monitorId = setInterval(() => {
    runTusdatosMonitor().catch((error) => {
      incrementMetric('monitor_run_failure')
      logEvent('error', 'monitor.run_failed', { error })
    })
  }, POLL_INTERVAL_MS)

  console.log('Monitor de consultas Tusdatos iniciado.')

  return () => {
    if (monitorId) clearInterval(monitorId)
    monitorId = null
  }
}

module.exports = {
  completeQuery,
  registerTusdatosLaunchResponse,
  runTusdatosMonitor,
  synchronizeTusdatosQuery,
  startTusdatosQueryMonitor,
}
