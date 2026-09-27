const { Query } = require('../../db')
const { retryTusdatosQuery } = require('../../services/tusdatosApi')

const POLL_INTERVAL_MS = Number(process.env.TUSDATOS_POLL_INTERVAL_MS || 5000)
const RETRY_SUPPORTED_TYPES = new Set(['CC', 'CE', 'INT', 'NIT', 'PP', 'PPT'])

function getFailedSources(query) {
  const summaryErrors = query.result_summary?.provider_source_errors
  const resultErrors = query.provider_response?.result?.errores
  const errors = Array.isArray(summaryErrors) ? summaryErrors : resultErrors
  return Array.isArray(errors) ? errors.filter(Boolean) : []
}

/**
 * Solicita al proveedor la recarga de las fuentes que fallaron en un reporte.
 * No descuenta créditos ni genera un movimiento de billetera.
 */
module.exports = async (req, res, next) => {
  try {
    const query = await Query.findOne({
      where: { id: req.params.queryId, user_id: req.user.userId },
    })

    if (!query) return res.status(404).json({ error: 'Consulta no encontrada.' })

    if (query.status !== 'completed') {
      return res.status(409).json({ error: 'Solo puedes actualizar una consulta finalizada.' })
    }

    const failedSources = getFailedSources(query)
    if (!failedSources.length) {
      return res.status(409).json({ error: 'Esta consulta no tiene fuentes pendientes por actualizar.' })
    }

    if (!RETRY_SUPPORTED_TYPES.has(query.document_type)) {
      return res.status(422).json({
        error: 'La actualización de fuentes no está disponible para este tipo de consulta.',
      })
    }

    if (!query.provider_report_id) {
      return res.status(409).json({ error: 'No hay un reporte disponible para actualizar.' })
    }

    let retryResponse
    try {
      retryResponse = await retryTusdatosQuery({
        reportId: query.provider_report_id,
        documentType: query.document_type,
      })
    } catch (error) {
      return res.status(error.status || 502).json({
        error: 'No fue posible iniciar la actualización de las fuentes. Inténtalo más tarde.',
      })
    }

    if (!retryResponse?.jobid) {
      return res.status(502).json({ error: 'La actualización no devolvió un identificador de seguimiento.' })
    }

    const now = new Date()
    await query.update({
      status: 'processing',
      provider_request_id: retryResponse.jobid,
      // Se limpia para volver a obtener el JSON actualizado al finalizar.
      provider_report_id: null,
      provider_response: { retry: { requested_at: now.toISOString(), failed_sources: failedSources } },
      provider_error: null,
      provider_poll_attempts: 0,
      provider_last_polled_at: null,
      provider_next_poll_at: new Date(now.getTime() + POLL_INTERVAL_MS),
      provider_started_at: now,
      provider_retry_count: (query.provider_retry_count || 0) + 1,
      completed_at: null,
    })

    return res.status(202).json({
      message: 'Actualización de fuentes iniciada. No se descontaron créditos.',
      query_id: query.id,
      status: 'processing',
      failed_sources: failedSources,
    })
  } catch (error) {
    return next(error)
  }
}
