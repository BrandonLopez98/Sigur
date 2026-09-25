const crypto = require('crypto')
const { Query } = require('../../db')
const {
  getTusdatosQueryResult,
  getTusdatosReportJson,
} = require('../../services/tusdatosApi')
const { refundQueryCredit } = require('../../services/refundQueryCredit')

function getRiskLevel(result) {
  if (!result.hallazgo) return 'low'

  const category = String(result.hallazgos || '').toLowerCase()
  if (category.includes('alto')) return 'high'
  if (category.includes('medio')) return 'medium'
  if (category.includes('bajo')) return 'low'
  return 'unknown'
}

function buildResultSummary(result, webhook, reportId) {
  const sourceResults = result.results || {}

  return {
    has_findings: Boolean(result.hallazgo),
    findings_category: result.hallazgos || null,
    sources_checked: Object.keys(sourceResults).length,
    sources_with_findings: Object.values(sourceResults).filter(
      (value) => value === true
    ).length,
    provider_duration_seconds: result.time || null,
    provider_report_id: reportId || null,
    provider_finished_at: webhook.finished_at || null,
  }
}

function isAuthorized(req) {
  const expectedToken = process.env.TUSDATOS_WEBHOOK_TOKEN
  const receivedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!expectedToken || !receivedToken) return false

  const expected = Buffer.from(expectedToken)
  const received = Buffer.from(receivedToken)

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  )
}

/**
 * Recibe individualCompleted de Tusdatos. El proveedor avisa que terminó y
 * Verifik consulta el resultado final con el jobid almacenado.
 */
module.exports = async (req, res, next) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Webhook no autorizado.' })
    }

    const { event_name, webhook_reference: webhookReference } = req.body

    if (event_name !== 'individualCompleted') {
      return res.status(200).json({ ignored: true })
    }

    const match = /^verifik-query:([\w-]+)$/.exec(webhookReference || '')

    if (!match) {
      return res.status(400).json({ error: 'Referencia de webhook inválida.' })
    }

    const query = await Query.findByPk(match[1])

    if (!query || !query.provider_request_id) {
      return res.status(404).json({ error: 'Consulta no encontrada.' })
    }

    // Los webhooks pueden llegar duplicados; no repetimos actualizaciones.
    if (query.status === 'completed') {
      return res.status(200).json({ received: true, already_processed: true })
    }

    const result = await getTusdatosQueryResult(query.provider_request_id)

    if (result.estado !== 'finalizado') {
      if (['fallido', 'failed', 'error'].includes(String(result.estado).toLowerCase())) {
        const { refunded } = await refundQueryCredit({
          queryId: query.id,
          reason: result.estado,
          providerResponse: result,
        })

        return res.status(200).json({ received: true, failed: true, refunded })
      }

      return res.status(202).json({ received: true, status: result.estado })
    }

    if (result.error) {
      const { refunded } = await refundQueryCredit({
        queryId: query.id,
        reason: result.errores?.join(' ') || 'Tusdatos no pudo completar la consulta.',
        providerResponse: result,
      })

      return res.status(200).json({ received: true, failed: true, refunded })
    }

    // Tusdatos entrega el identificador estable del reporte tanto en el webhook
    // como en la respuesta final. Lo guardamos para ver el PDF después.
    const reportId = req.body.reportId || result.id || query.provider_report_id
    let reportJson = null
    try {
      reportJson = reportId ? await getTusdatosReportJson(reportId) : null
    } catch (error) {
      // No dejamos una consulta finalizada indefinidamente en procesamiento si
      // Tusdatos tarda unos instantes en publicar el reporte detallado.
      console.error('No fue posible guardar el reporte JSON de Tusdatos:', error.message)
    }

    await query.update({
      status: 'completed',
      risk_level: getRiskLevel(result),
      search_name: result.nombre || query.search_name,
      provider_report_id: reportId,
      // Se preserva la respuesta final y el reporte detallado para que el
      // frontend pueda presentar su propia vista antes de descargar el PDF.
      provider_response: { result, report: reportJson },
      result_summary: buildResultSummary(result, req.body, reportId),
      completed_at: new Date(),
      provider_error: null,
    })

    return res.status(200).json({ received: true, updated: true })
  } catch (error) {
    return next(error)
  }
}
