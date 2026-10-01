const {
  getSourceErrorNames,
  getSourceStatuses,
} = require('./tusdatosSourceStatus')

function getRiskLevel(result = {}) {
  const category = String(result.hallazgos || '').toLowerCase()
  if (category.includes('alto')) return 'high'
  if (category.includes('medio')) return 'medium'

  const findingGroups = result.dict_hallazgos || {}
  if (Array.isArray(findingGroups.altos) && findingGroups.altos.length) return 'high'
  if (Array.isArray(findingGroups.medios) && findingGroups.medios.length) return 'medium'

  const sourceStatuses = Array.from(getSourceStatuses(result).values())
  const hasMalformedResults = result.results !== undefined
    && (!result.results || typeof result.results !== 'object' || Array.isArray(result.results))
  const hasIncompleteCoverage = Boolean(result.error)
    || Boolean(result.errores && (!Array.isArray(result.errores) || result.errores.length > 0))
    || hasMalformedResults
    || sourceStatuses.some((status) => ['error', 'unavailable', 'unknown'].includes(status))

  // Un hallazgo grave se conserva aunque otras fuentes fallen. En cambio, una
  // clasificación favorable requiere que no existan huecos de cobertura.
  if (hasIncompleteCoverage) return 'unknown'

  if (category.includes('bajo')) return 'low'
  if (Array.isArray(findingGroups.bajos) && findingGroups.bajos.length) return 'low'
  if (result.hallazgo === false) return 'low'
  if (sourceStatuses.length > 0 && sourceStatuses.every((status) => status === 'clear')) return 'low'

  return 'unknown'
}

function buildResultSummary(result = {}, { reportId, finishedAt } = {}) {
  const sourceConfig = result.source_config
    && typeof result.source_config === 'object'
    && !Array.isArray(result.source_config)
    ? result.source_config
    : {}
  const findingGroups = result.dict_hallazgos || {}
  const sourceStatuses = Array.from(getSourceStatuses(result).values())
  const sourceErrors = getSourceErrorNames(result)
  const findingCount = Object.values(findingGroups).reduce((total, value) => {
    if (Array.isArray(value)) return total + value.length
    if (value && typeof value === 'object') return total + Object.keys(value).length
    return total + (value ? 1 : 0)
  }, 0)
  const sourcesChecked = sourceStatuses.filter((status) => ['finding', 'clear'].includes(status)).length
  const sourcesWithFindings = sourceStatuses.filter((status) => status === 'finding').length || findingCount
  const sourcesUnknown = sourceStatuses.filter((status) => status === 'unknown').length
  const sourcesUnavailable = sourceStatuses.filter((status) => ['error', 'unavailable'].includes(status)).length

  return {
    has_findings: Boolean(result.hallazgo || findingCount || result.hallazgos),
    findings_category: result.hallazgos || null,
    sources_requested: Object.keys(sourceConfig).length || sourceStatuses.length,
    sources_checked: sourcesChecked,
    sources_with_findings: sourcesWithFindings,
    sources_unknown: sourcesUnknown,
    sources_unavailable: sourcesUnavailable,
    coverage_complete: sourceStatuses.length > 0
      && !result.error
      && sourcesUnknown === 0
      && sourcesUnavailable === 0,
    provider_duration_seconds: result.time || null,
    provider_report_id: reportId || null,
    provider_finished_at: finishedAt || null,
    provider_source_errors: sourceErrors,
    has_provider_source_errors: Boolean(result.error || sourceErrors.length),
  }
}

module.exports = { buildResultSummary, getRiskLevel }
