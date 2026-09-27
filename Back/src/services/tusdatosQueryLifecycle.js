const { Op } = require('sequelize')
const { Query } = require('../db')
const {
  getTusdatosQueryResult,
  getTusdatosReportJson,
  hasTusdatosConfiguration,
  isTerminalTusdatosError,
} = require('./tusdatosApi')
const { refundQueryCredit } = require('./refundQueryCredit')

const INITIAL_DELAY_MS = Number(process.env.TUSDATOS_POLL_INITIAL_DELAY_MS || 60000)
const POLL_INTERVAL_MS = Number(process.env.TUSDATOS_POLL_INTERVAL_MS || 5000)
const JOB_TIMEOUT_MS = Number(process.env.TUSDATOS_JOB_TIMEOUT_MS || 6900000)
const MONITOR_ENABLED = process.env.TUSDATOS_QUERY_MONITOR_ENABLED !== 'false'
const inFlightQueries = new Set()
let monitorId = null

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase()
}

function getRiskLevel(result) {
  if (!result.hallazgo) return 'low'

  const category = String(result.hallazgos || '').toLowerCase()
  if (category.includes('alto')) return 'high'
  if (category.includes('medio')) return 'medium'
  if (category.includes('bajo')) return 'low'
  return 'unknown'
}

function buildResultSummary(result, { reportId, finishedAt } = {}) {
  const sourceResults = result.results || {}
  const sourceErrors = Array.isArray(result.errores) ? result.errores : []

  return {
    has_findings: Boolean(result.hallazgo),
    findings_category: result.hallazgos || null,
    sources_checked: Object.keys(sourceResults).length,
    sources_with_findings: Object.values(sourceResults).filter((value) => value === true).length,
    provider_duration_seconds: result.time || null,
    provider_report_id: reportId || null,
    provider_finished_at: finishedAt || null,
    // Un error de fuente no invalida necesariamente todo el reporte. Se
    // conserva para que el usuario conozca la cobertura del resultado.
    provider_source_errors: sourceErrors,
    has_provider_source_errors: Boolean(result.error || sourceErrors.length),
  }
}

function getNextPollDate(now = new Date()) {
  return new Date(now.getTime() + POLL_INTERVAL_MS)
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
      console.error('No fue posible guardar el reporte JSON de Tusdatos:', error.message)
    }
  }

  await query.update({
    status: 'completed',
    risk_level: getRiskLevel(result),
    search_name: result.nombre || query.search_name,
    provider_report_id: finalReportId,
    provider_response: { result, report: reportJson },
    result_summary: buildResultSummary(result, { reportId: finalReportId, finishedAt }),
    provider_error: null,
    provider_last_polled_at: new Date(),
    provider_next_poll_at: null,
    completed_at: new Date(),
  })

  return query
}

async function markTemporaryState(query, result = null) {
  await query.update({
    status: 'processing',
    provider_response: result || query.provider_response,
    provider_last_polled_at: new Date(),
    provider_next_poll_at: getNextPollDate(),
    provider_poll_attempts: (query.provider_poll_attempts || 0) + 1,
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
    if (!query.provider_request_id) return { state: 'waiting_launch', query }

    const providerStartedAt = query.provider_started_at || query.created_at
    if (Date.now() - new Date(providerStartedAt).getTime() > JOB_TIMEOUT_MS) {
      const failed = await refundQueryCredit({
        queryId: query.id,
        reason: 'El tiempo máximo de seguimiento de Tusdatos fue excedido.',
      })
      return { state: 'failed', ...failed }
    }

    try {
      const result = await getTusdatosQueryResult(query.provider_request_id)
      const status = normalizeStatus(result.estado)

      if (status === 'finalizado') {
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
      return { state: 'failed', ...failed, result }
    } catch (error) {
      if (isTerminalTusdatosError(error)) {
        const failed = await refundQueryCredit({
          queryId: query.id,
          reason: error.message,
          providerResponse: error.providerResponse || null,
        })
        return { state: 'failed', ...failed, error }
      }

      const processingQuery = await markTemporaryState(query)
      return { state: 'retrying', query: processingQuery, error }
    }
  } finally {
    inFlightQueries.delete(queryId)
  }
}

async function runTusdatosMonitor() {
  if (!MONITOR_ENABLED || !hasTusdatosConfiguration()) return

  const now = new Date()
  const candidates = await Query.findAll({
    where: {
      status: { [Op.in]: ['pending', 'processing'] },
      provider_request_id: { [Op.ne]: null },
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

    if (Date.now() >= nextPollAt) {
      await synchronizeTusdatosQuery(query.id)
    }
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
    console.error('Error inicial del monitor de Tusdatos:', error.message)
  })

  monitorId = setInterval(() => {
    runTusdatosMonitor().catch((error) => {
      console.error('Error en el monitor de Tusdatos:', error.message)
    })
  }, POLL_INTERVAL_MS)

  console.log('Monitor de consultas Tusdatos iniciado.')

  return () => {
    if (monitorId) clearInterval(monitorId)
    monitorId = null
  }
}

module.exports = {
  synchronizeTusdatosQuery,
  startTusdatosQueryMonitor,
}
