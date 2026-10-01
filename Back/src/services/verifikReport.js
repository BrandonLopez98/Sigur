const { getSourceStatuses } = require('./tusdatosSourceStatus')

const PROVIDER_BRAND_PATTERN = /(?:https?:\/\/)?(?:dash-board\.)?tusdatos(?:\.co)?/gi
const INTERNAL_KEY_PATTERN = /(?:authorization|password|token|provider|job_?id|request_?id|report_?id|html|pdf|logo|watermark|tusdatos)/i
const URL_KEY_PATTERN = /(?:^|_)(?:url|uri|href|link|enlace)(?:$|_)/i
const SUMMARY_KEYS = new Set([
  'dict_hallazgos',
  'errores',
  'error',
  'hallazgo',
  'hallazgos',
  'source_config',
  'results',
  'time',
])
const WRAPPER_KEYS = new Set(['data', 'datos', 'informacion', 'información', 'reporte', 'report'])
const PROFILE_KEY_PATTERN = /^(?:nombre|name|documento|document|cedula|cédula|nit|estado|status|genero|género|fecha_expedicion|fecha_de_expedicion|expedition_date)$/i

function humanizeKey(value) {
  return String(value || '')
    .replace(/([a-záéíóúñ])([A-Z])/g, '$1 $2')
    .replaceAll(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function sanitizeText(value) {
  return String(value).replace(PROVIDER_BRAND_PATTERN, 'Verifik')
}

function isEmpty(value) {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function sanitizeValue(value, key = '', depth = 0) {
  if (depth > 7 || INTERNAL_KEY_PATTERN.test(key) || URL_KEY_PATTERN.test(key)) return undefined

  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) return undefined
    return sanitizeText(value)
  }

  if (value === null || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    const items = value
      .slice(0, 250)
      .map((item) => sanitizeValue(item, key, depth + 1))
      .filter((item) => !isEmpty(item))
    return items.length ? items : undefined
  }

  const result = {}
  for (const [childKey, childValue] of Object.entries(value)) {
    const sanitized = sanitizeValue(childValue, childKey, depth + 1)
    if (!isEmpty(sanitized)) result[humanizeKey(childKey)] = sanitized
  }
  return Object.keys(result).length ? result : undefined
}

function countRecords(value) {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  return isEmpty(value) ? 0 : 1
}

function makeSection(key, value, index) {
  const sanitized = sanitizeValue(value, key)
  if (isEmpty(sanitized)) return null

  return {
    id: `source-${index + 1}`,
    title: humanizeKey(key),
    record_count: countRecords(sanitized),
    data: sanitized,
  }
}

function buildSourceIndex(report, sections) {
  const sources = new Map()
  const sourceStatuses = getSourceStatuses(report)

  for (const [key, status] of sourceStatuses.entries()) {
    if (!INTERNAL_KEY_PATTERN.test(key)) {
      sources.set(humanizeKey(key), {
        name: humanizeKey(key),
        status,
      })
    }
  }

  for (const section of sections) {
    if (!sources.has(section.title)) {
      sources.set(section.title, { name: section.title, status: 'unknown' })
    }
  }

  return Array.from(sources.values()).sort((left, right) => left.name.localeCompare(right.name, 'es'))
}

function buildVerifikReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    return { findings: {}, profile: [], source_index: [], report_sections: [] }
  }

  const profile = []
  const candidates = []

  for (const [key, value] of Object.entries(report)) {
    const normalizedKey = key.toLowerCase()
    if (SUMMARY_KEYS.has(normalizedKey) || INTERNAL_KEY_PATTERN.test(key)) continue

    if (PROFILE_KEY_PATTERN.test(key) && (typeof value !== 'object' || value === null)) {
      const sanitized = sanitizeValue(value, key)
      if (!isEmpty(sanitized)) profile.push({ label: humanizeKey(key), value: sanitized })
      continue
    }

    if (WRAPPER_KEYS.has(normalizedKey) && value && typeof value === 'object' && !Array.isArray(value)) {
      candidates.push(...Object.entries(value))
    } else {
      candidates.push([key, value])
    }
  }

  const reportSections = candidates
    .map(([key, value], index) => makeSection(key, value, index))
    .filter(Boolean)

  const findings = {}
  for (const key of ['altos', 'medios', 'bajos', 'infos']) {
    findings[key] = sanitizeValue(report.dict_hallazgos?.[key] || [], key) || []
  }

  return {
    findings,
    profile,
    source_index: buildSourceIndex(report, reportSections),
    report_sections: reportSections,
  }
}

module.exports = { buildVerifikReport, humanizeKey, sanitizeText, sanitizeValue }
