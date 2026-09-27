const DEFAULT_BASE_MS = 5000
const DEFAULT_MAX_MS = 30000
const DEFAULT_JITTER_RATIO = 0.2

function readPositiveNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getPollBackoffMs(attempt, random = Math.random) {
  const baseMs = readPositiveNumber(process.env.TUSDATOS_POLL_INTERVAL_MS, DEFAULT_BASE_MS)
  const maxMs = readPositiveNumber(process.env.TUSDATOS_POLL_MAX_INTERVAL_MS, DEFAULT_MAX_MS)
  const safeAttempt = Math.max(1, Number(attempt) || 1)
  const exponentialMs = Math.min(maxMs, baseMs * (2 ** Math.min(safeAttempt - 1, 8)))
  const jitter = exponentialMs * DEFAULT_JITTER_RATIO
  const randomValue = Math.max(0, Math.min(1, Number(random()) || 0))

  return Math.max(baseMs, Math.round(exponentialMs - jitter + (2 * jitter * randomValue)))
}

function getMonitorLeaseMs() {
  return readPositiveNumber(process.env.TUSDATOS_MONITOR_LEASE_MS, 60000)
}

function getMaxPollAttempts() {
  return Math.max(1, Math.round(readPositiveNumber(process.env.TUSDATOS_MAX_POLL_ATTEMPTS, 240)))
}

module.exports = { getMaxPollAttempts, getMonitorLeaseMs, getPollBackoffMs }
