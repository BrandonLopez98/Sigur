const { getRiskLevel } = require('../../../services/tusdatosReport')

const LONG_WAIT_MS = Number(process.env.TUSDATOS_LONG_WAIT_MS || 180000)

function getElapsedMs(query) {
  const startedAt = query.provider_started_at || query.created_at
  const timestamp = startedAt ? new Date(startedAt).getTime() : NaN
  return Number.isFinite(timestamp) ? Math.max(0, Date.now() - timestamp) : 0
}

function serializeQueryProgress(query) {
  const data = typeof query.toJSON === 'function' ? query.toJSON() : { ...query }
  const response = data.provider_response || {}
  const resultForRisk = response.report || response.result || null

  // Recalcula solo la presentación de consultas antiguas. Así, un riesgo bajo
  // persistido con la regla anterior no sigue ocultando errores de cobertura.
  if (data.status === 'completed' && resultForRisk) {
    data.risk_level = getRiskLevel(resultForRisk)
  }

  const rawPercentage = response.percentage ?? response.result?.percentage
  const parsedPercentage = Number(rawPercentage)
  const providerPercentage = Number.isFinite(parsedPercentage)
    ? Math.max(0, Math.min(99, Math.round(parsedPercentage)))
    : null
  const elapsedMs = getElapsedMs(data)

  let progress
  if (data.status === 'completed') {
    progress = { percentage: 100, estimated: false, label: 'Verificación finalizada' }
  } else if (data.status === 'failed') {
    progress = {
      percentage: 0,
      estimated: false,
      label: data.credit_refunded_at
        ? 'La verificación falló y el crédito fue reintegrado'
        : 'La verificación no pudo finalizar',
    }
  } else if (providerPercentage !== null) {
    progress = {
      percentage: providerPercentage,
      estimated: false,
      label: `Consultando fuentes: ${providerPercentage}% de avance`,
    }
  } else if (!data.provider_request_id) {
    progress = {
      percentage: 8,
      estimated: true,
      label: data.provider_report_id
        ? 'Recuperando el reporte disponible'
        : 'Esperando confirmación de Verifik',
    }
  } else if (elapsedMs >= LONG_WAIT_MS) {
    progress = {
      percentage: 65,
      estimated: true,
      label: 'Verifik está tardando más de lo habitual; seguimos verificando',
    }
  } else if (elapsedMs >= 60000) {
    progress = {
      percentage: 40,
      estimated: true,
      label: 'Verifik continúa consultando las fuentes',
    }
  } else if (data.status === 'processing') {
    progress = { percentage: 20, estimated: true, label: 'Verifik está consultando las fuentes' }
  } else {
    progress = { percentage: 5, estimated: true, label: 'Preparando la verificación' }
  }

  delete data.provider_response
  delete data.provider_error

  return {
    ...data,
    progress,
    can_refresh_status: ['pending', 'processing'].includes(data.status),
  }
}

module.exports = { serializeQueryProgress }
