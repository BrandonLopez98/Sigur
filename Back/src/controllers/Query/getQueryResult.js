const { Query } = require('../../db')
const { getTusdatosReportJson } = require('../../services/tusdatosApi')
const { buildVerifikReport } = require('../../services/verifikReport')
const { getRiskLevel } = require('../../services/tusdatosReport')

/**
 * Entrega el resultado persistido únicamente al usuario que creó la consulta.
 * El frontend usa esta ruta para construir la vista detallada de Verifik.
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
      return res.status(404).json({ error: 'Consulta no encontrada.' })
    }

    if (query.status !== 'completed') {
      return res.status(409).json({
        error: 'El resultado todavía no está disponible.',
        status: query.status,
      })
    }

    const persistedFailedSources = query.result_summary?.provider_source_errors
      || query.provider_response?.result?.errores
      || []

    // Tusdatos puede finalizar el trabajo unos segundos antes de que publique
    // el JSON detallado. Recuperamos y persistimos ese reporte al abrirlo.
    let report = query.provider_response?.report || null

    if (!report && query.provider_report_id) {
      try {
        report = await getTusdatosReportJson(query.provider_report_id)
        await query.update({
          provider_response: {
            ...(query.provider_response || {}),
            report,
          },
        })
      } catch (reportError) {
        // Conservamos el resumen y dejamos que el cliente reintente sin marcar
        // una consulta terminada como fallida.
        console.warn('El reporte JSON de Tusdatos aún no está disponible:', reportError.message)
      }
    }

    const reportView = buildVerifikReport(report)
    const resultForRisk = report || query.provider_response?.result || null
    const detectedFailedSources = reportView.source_index
      .filter((source) => ['error', 'unavailable'].includes(source.status))
      .map((source) => source.name)
    const failedSources = Array.from(new Set([
      ...(Array.isArray(persistedFailedSources) ? persistedFailedSources : []),
      ...detectedFailedSources,
    ].filter((source) => typeof source === 'string' && source.trim())))

    return res.status(200).json({
      id: query.id,
      document_type: query.document_type,
      document_number: query.document_number,
      search_name: query.search_name,
      status: query.status,
      risk_level: resultForRisk ? getRiskLevel(resultForRisk) : query.risk_level,
      completed_at: query.completed_at,
      summary: query.result_summary,
      report_ready: Boolean(report),
      ...reportView,
      failed_sources: Array.isArray(failedSources) ? failedSources : [],
      retry_available: query.document_type !== 'PLACA' && Array.isArray(failedSources) && failedSources.length > 0,
    })
  } catch (error) {
    return next(error)
  }
}
