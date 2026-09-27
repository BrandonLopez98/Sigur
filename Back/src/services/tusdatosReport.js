function getRiskLevel(result = {}) {
  const category = String(result.hallazgos || '').toLowerCase()
  if (category.includes('alto')) return 'high'
  if (category.includes('medio')) return 'medium'
  if (category.includes('bajo')) return 'low'

  const findingGroups = result.dict_hallazgos || {}
  if (Array.isArray(findingGroups.altos) && findingGroups.altos.length) return 'high'
  if (Array.isArray(findingGroups.medios) && findingGroups.medios.length) return 'medium'
  if (Array.isArray(findingGroups.bajos) && findingGroups.bajos.length) return 'low'
  if (!result.hallazgo) return 'low'

  return 'unknown'
}

function buildResultSummary(result = {}, { reportId, finishedAt } = {}) {
  const sourceResults = result.results || {}
  const sourceConfig = result.source_config || {}
  const findingGroups = result.dict_hallazgos || {}
  const sourceErrors = Array.isArray(result.errores) ? result.errores : []
  const findingCount = Object.values(findingGroups).reduce((total, value) => {
    if (Array.isArray(value)) return total + value.length
    if (value && typeof value === 'object') return total + Object.keys(value).length
    return total + (value ? 1 : 0)
  }, 0)
  const sourcesChecked = Object.keys(sourceResults).length || Object.keys(sourceConfig).length
  const sourcesWithFindings = Object.keys(sourceResults).length
    ? Object.values(sourceResults).filter((value) => value === true).length
    : findingCount

  return {
    has_findings: Boolean(result.hallazgo || findingCount || result.hallazgos),
    findings_category: result.hallazgos || null,
    sources_checked: sourcesChecked,
    sources_with_findings: sourcesWithFindings,
    provider_duration_seconds: result.time || null,
    provider_report_id: reportId || null,
    provider_finished_at: finishedAt || null,
    provider_source_errors: sourceErrors,
    has_provider_source_errors: Boolean(result.error || sourceErrors.length),
  }
}

module.exports = { buildResultSummary, getRiskLevel }
