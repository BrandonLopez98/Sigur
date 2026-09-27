const { getMetricsSnapshot } = require('../../services/observability')

function getHealth(req, res) {
  return res.status(200).json({
    status: 'ok',
    request_id: req.requestId,
    uptime_seconds: Math.round(process.uptime()),
  })
}

function getHealthMetrics(req, res) {
  return res.status(200).json({
    status: 'ok',
    request_id: req.requestId,
    ...getMetricsSnapshot(),
  })
}

module.exports = { getHealth, getHealthMetrics }
