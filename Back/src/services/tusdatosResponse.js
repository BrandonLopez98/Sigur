function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return null
}

function normalizeProviderStatus(value) {
  return String(value || '').trim().toLowerCase()
}

/**
 * Convierte las variantes conocidas de /api/launch en un contrato interno.
 * Tusdatos puede devolver un job nuevo o reutilizar un reporte ya existente.
 */
function classifyTusdatosLaunchResponse(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return { kind: 'invalid', jobId: null, reportId: null }
  }

  const jobId = firstNonEmptyString(
    response.jobid,
    response.jobId,
    response.job_id,
    response.jobkey,
    response.jobKey
  )
  const reportId = firstNonEmptyString(
    response.reportId,
    response.report_id,
    response.id
  )
  const status = normalizeProviderStatus(response.estado || response.status || response.Estado)
  const message = String(response.error || response.message || response.detail || '').trim()
  const reusedReport = /consultado\s+previamente|previously\s+queried/i.test(message)
  const completed = ['finalizado', 'finalizada', 'completed', 'complete'].includes(status)

  if (reportId && (reusedReport || completed || !jobId)) {
    return { kind: 'report_ready', jobId, reportId, status, message }
  }

  if (jobId) {
    return { kind: 'processing', jobId, reportId, status, message }
  }

  if (reportId) {
    return { kind: 'report_ready', jobId, reportId, status, message }
  }

  return { kind: 'invalid', jobId: null, reportId: null, status, message }
}

function getStoredTusdatosReportId(query) {
  const response = query?.provider_response

  return firstNonEmptyString(
    query?.provider_report_id,
    response?.reportId,
    response?.report_id,
    response?.id,
    response?.result?.reportId,
    response?.result?.report_id,
    response?.result?.id
  )
}

module.exports = {
  classifyTusdatosLaunchResponse,
  firstNonEmptyString,
  getStoredTusdatosReportId,
  normalizeProviderStatus,
}
