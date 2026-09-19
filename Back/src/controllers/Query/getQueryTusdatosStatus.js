const { Query } = require('../../db')
const {
  getTusdatosQueryResult,
  getTusdatosReportJson,
} = require('../../services/tusdatosApi')

function getRiskLevel(result) {
  if (!result.hallazgo) return 'low'

  const category = String(result.hallazgos || '').toLowerCase()

  if (category.includes('alto')) return 'high'
  if (category.includes('medio')) return 'medium'
  if (category.includes('bajo')) return 'low'

  return 'unknown'
}

function buildResultSummary(result, reportId) {
  const sourceResults = result.results || {}
  const sourceValues = Object.values(sourceResults)

  return {
    has_findings: Boolean(result.hallazgo),
    findings_category: result.hallazgos || null,
    sources_checked: Object.keys(sourceResults).length,
    sources_with_findings: sourceValues.filter((value) => value === true).length,
    provider_duration_seconds: result.time || null,
    provider_report_id: reportId || null,
  }
}

/**
 * Actualiza una consulta propia de Verifik con el estado de Tusdatos.
 */
module.exports = async (req, res, next) => {
  try {
    const query = await Query.findOne({
      where: {
        id: req.params.queryId,
        user_id: req.user.userId,
      },
    })

    if (!query) {
      return res.status(404).json({
        error: 'Consulta no encontrada.',
      })
    }

    if (!query.provider_request_id) {
      return res.status(409).json({
        error: 'La consulta todavía no tiene un identificador de Tusdatos.',
      })
    }

    const result = await getTusdatosQueryResult(query.provider_request_id)

    if (result.estado === 'procesando') {
      await query.update({
        status: 'processing',
        provider_response: result,
      })

      return res.status(202).json({
        query,
        provider_status: 'processing',
      })
    }

    if (result.estado === 'finalizado') {
      const reportId = result.id || query.provider_report_id
      let reportJson = null
      try {
        reportJson = reportId ? await getTusdatosReportJson(reportId) : null
      } catch (error) {
        console.error('No fue posible guardar el reporte JSON de Tusdatos:', error.message)
      }

      await query.update({
        status: 'completed',
        risk_level: getRiskLevel(result),
        search_name: result.nombre || query.search_name,
        provider_report_id: reportId,
        provider_response: { result, report: reportJson },
        result_summary: buildResultSummary(result, reportId),
        completed_at: new Date(),
        provider_error: null,
      })

      return res.status(200).json({
        query,
        provider_status: 'completed',
      })
    }

    await query.update({
      status: 'failed',
      provider_response: result,
      provider_error: result.estado || 'Tusdatos devolvió un estado no reconocido.',
    })

    return res.status(502).json({
      error: 'Tusdatos no pudo finalizar la consulta.',
      query,
    })
  } catch (error) {
    return next(error)
  }
}
