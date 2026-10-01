const ERROR_PATTERN = /(?:^|\b)(?:error|failed|fallo|fallido|fallida|excepcion|invalido|invalida)(?:\b|$)/i
const UNAVAILABLE_PATTERN = /(?:no disponible|unavailable|no responde|sin respuesta|timeout|tiempo de espera|caida|inaccesible)/i
const FINDING_PATTERN = /^(?:true|si|sí|finding|hallazgo|con hallazgo)$/i
const CLEAR_PATTERN = /^(?:false|no|clear|limpio|limpia|sin hallazgo|sin hallazgos)$/i

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Convierte únicamente valores conocidos del proveedor. Cualquier variante no
 * reconocida conserva la incertidumbre y nunca se interpreta como favorable.
 */
function normalizeSourceStatus(value) {
  if (value === true) return 'finding'
  if (value === false) return 'clear'
  if (value === null || value === undefined || value === '') return 'unknown'

  if (typeof value === 'string') {
    const normalized = normalizeText(value)
    if (UNAVAILABLE_PATTERN.test(normalized)) return 'unavailable'
    if (ERROR_PATTERN.test(normalized)) return 'error'
    if (FINDING_PATTERN.test(normalized)) return 'finding'
    if (CLEAR_PATTERN.test(normalized)) return 'clear'
    return 'unknown'
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.available === false || value.disponible === false) return 'unavailable'
    if (value.error) return 'error'
    if (typeof value.hallazgo === 'boolean') return value.hallazgo ? 'finding' : 'clear'

    for (const key of ['status', 'estado', 'result', 'resultado']) {
      if (value[key] !== undefined) return normalizeSourceStatus(value[key])
    }
  }

  return 'unknown'
}

function getSourceErrorName(error) {
  if (typeof error === 'string') return error.trim()
  if (!error || typeof error !== 'object') return null

  for (const key of ['fuente', 'source', 'nombre', 'name', 'codigo', 'code']) {
    if (typeof error[key] === 'string' && error[key].trim()) return error[key].trim()
  }

  return null
}

/**
 * Reúne el estado operativo de cada fuente sin mezclarlo con el nivel global
 * de riesgo. Las fuentes configuradas pero sin respuesta quedan como unknown.
 */
function getSourceStatuses(report = {}) {
  const statuses = new Map()
  const config = report.source_config
    && typeof report.source_config === 'object'
    && !Array.isArray(report.source_config)
    ? report.source_config
    : {}
  const results = report.results
    && typeof report.results === 'object'
    && !Array.isArray(report.results)
    ? report.results
    : {}

  for (const [source, enabled] of Object.entries(config)) {
    if (enabled !== false) statuses.set(source, 'unknown')
  }

  for (const [source, value] of Object.entries(results)) {
    statuses.set(source, normalizeSourceStatus(value))
  }

  const sourceErrors = Array.isArray(report.errores) ? report.errores : []
  for (const sourceError of sourceErrors) {
    const source = getSourceErrorName(sourceError)
    if (!source) continue
    if (statuses.get(source) !== 'error') statuses.set(source, 'unavailable')
  }

  return statuses
}

function getSourceErrorNames(report = {}) {
  return Array.from(getSourceStatuses(report).entries())
    .filter(([, status]) => ['error', 'unavailable'].includes(status))
    .map(([source]) => source)
}

module.exports = {
  getSourceErrorNames,
  getSourceStatuses,
  normalizeSourceStatus,
}
