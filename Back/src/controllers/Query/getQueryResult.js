const { Query } = require('../../db')

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

    return res.status(200).json({
      id: query.id,
      document_type: query.document_type,
      document_number: query.document_number,
      search_name: query.search_name,
      status: query.status,
      risk_level: query.risk_level,
      completed_at: query.completed_at,
      summary: query.result_summary,
      report: query.provider_response?.report || null,
      can_download_pdf: Boolean(query.provider_report_id),
    })
  } catch (error) {
    return next(error)
  }
}
