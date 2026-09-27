const test = require('node:test')
const assert = require('node:assert/strict')
const {
  getMaxPollAttempts,
  getMonitorLeaseMs,
  getPollBackoffMs,
} = require('../src/services/tusdatosBackoff')

test('aplica backoff exponencial con máximo y jitter controlado', () => {
  const previousBase = process.env.TUSDATOS_POLL_INTERVAL_MS
  const previousMax = process.env.TUSDATOS_POLL_MAX_INTERVAL_MS
  process.env.TUSDATOS_POLL_INTERVAL_MS = '5000'
  process.env.TUSDATOS_POLL_MAX_INTERVAL_MS = '30000'

  try {
    assert.equal(getPollBackoffMs(1, () => 0.5), 5000)
    assert.equal(getPollBackoffMs(2, () => 0.5), 10000)
    assert.equal(getPollBackoffMs(3, () => 0.5), 20000)
    assert.equal(getPollBackoffMs(4, () => 0.5), 30000)
    assert.equal(getPollBackoffMs(8, () => 0.5), 30000)
    assert.equal(getPollBackoffMs(2, () => 0), 8000)
    assert.equal(getPollBackoffMs(2, () => 1), 12000)
  } finally {
    if (previousBase === undefined) delete process.env.TUSDATOS_POLL_INTERVAL_MS
    else process.env.TUSDATOS_POLL_INTERVAL_MS = previousBase
    if (previousMax === undefined) delete process.env.TUSDATOS_POLL_MAX_INTERVAL_MS
    else process.env.TUSDATOS_POLL_MAX_INTERVAL_MS = previousMax
  }
})

test('normaliza límites inválidos del monitor', () => {
  const previousAttempts = process.env.TUSDATOS_MAX_POLL_ATTEMPTS
  const previousLease = process.env.TUSDATOS_MONITOR_LEASE_MS
  process.env.TUSDATOS_MAX_POLL_ATTEMPTS = '-1'
  process.env.TUSDATOS_MONITOR_LEASE_MS = 'invalid'

  try {
    assert.equal(getMaxPollAttempts(), 240)
    assert.equal(getMonitorLeaseMs(), 60000)
  } finally {
    if (previousAttempts === undefined) delete process.env.TUSDATOS_MAX_POLL_ATTEMPTS
    else process.env.TUSDATOS_MAX_POLL_ATTEMPTS = previousAttempts
    if (previousLease === undefined) delete process.env.TUSDATOS_MONITOR_LEASE_MS
    else process.env.TUSDATOS_MONITOR_LEASE_MS = previousLease
  }
})
