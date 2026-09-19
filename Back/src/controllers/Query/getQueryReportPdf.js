const { Query } = require('../../db')
const { getTusdatosReportPdf } = require('../../services/tusdatosApi')

/**
 * Descarga el PDF desde Tusdatos en el backend. Así nunca exponemos las
 * credenciales del proveedor ni un enlace público a un reporte privado.
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

    if (query.status !== 'completed' || !query.provider_report_id) {
      return res.status(409).json({
        error: 'El PDF todavía no está disponible para esta consulta.',
      })
    }

    const pdf = await getTusdatosReportPdf(
      query.provider_report_id,
      query.document_type
    )
    const fileName = `verifik-${query.document_number}-${query.id}.pdf`

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdf.length,
      'Cache-Control': 'private, no-store',
    })

    return res.status(200).send(pdf)
  } catch (error) {
    return next(error)
  }
}
