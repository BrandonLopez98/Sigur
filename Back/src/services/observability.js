const { AsyncLocalStorage } = require('async_hooks')

const SENSITIVE_KEY_PATTERN = /(?:authorization|password|token|document|cedula|doc|report|response|payload)/i
const metrics = new Map()
const logContext = new AsyncLocalStorage()

function sanitize(value, depth = 0) {
  if (depth > 4) return '[truncated]'
  if (value === null || value === undefined) return value
  if (value instanceof Error) return { name: value.name, message: value.message }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitize(item, depth + 1))
  if (typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, item]) => [key, sanitize(item, depth + 1)])
  )
}

function logEvent(level, event, details = {}) {
  const context = logContext.getStore() || {}
  const entry = {
    timestamp: new Date().toISOString(),
    service: 'sigur-back',
    level,
    event,
    ...sanitize(context),
    ...sanitize(details),
  }
  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  writer(JSON.stringify(entry))
  return entry
}

function runWithLogContext(context, callback) {
  return logContext.run(context, callback)
}

function incrementMetric(name, amount = 1) {
  metrics.set(name, (metrics.get(name) || 0) + amount)
}

function observeDuration(name, durationMs) {
  incrementMetric(`${name}_count`)
  incrementMetric(`${name}_total_ms`, Math.max(0, Math.round(durationMs)))
}

function getMetricsSnapshot() {
  return {
    generated_at: new Date().toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    counters: Object.fromEntries(metrics),
  }
}

module.exports = {
  getMetricsSnapshot,
  incrementMetric,
  logEvent,
  observeDuration,
  runWithLogContext,
  sanitize,
}
