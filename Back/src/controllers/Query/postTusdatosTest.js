const {
  launchTusdatosQuery,
} = require('../../services/tusdatosApi')

const ALLOWED_DOCUMENT_TYPES = new Set([
  'CC',
  'CE',
  'NIT',
  'PPT',
  'PP',
  'PAS',
  'INT',
  'NOMBRE',
])

/**
 * Ruta temporal para comprobar la conexión de Verifik con Tusdatos.
 * No descuenta créditos ni crea una consulta definitiva en nuestra base de datos.
 */
module.exports = async (req, res, next) => {
  try {
    const {
      document_number: documentNumber,
      document_type: documentType,
      issue_date: issueDate,
    } = req.body

    if (!documentNumber || !documentType) {
      return res.status(400).json({
        error: 'document_number y document_type son obligatorios.',
      })
    }

    const normalizedDocumentType = String(documentType).trim().toUpperCase()

    if (!ALLOWED_DOCUMENT_TYPES.has(normalizedDocumentType)) {
      return res.status(400).json({
        error: 'El tipo de documento no es válido para Tusdatos.',
      })
    }

    // CE y PPT requieren fecha de expedición según el contrato de Tusdatos.
    if (
      ['CE', 'PPT'].includes(normalizedDocumentType) &&
      !issueDate
    ) {
      return res.status(400).json({
        error: 'issue_date es obligatoria para CE y PPT.',
      })
    }

    if (issueDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(issueDate)) {
      return res.status(400).json({
        error: 'issue_date debe usar el formato DD/MM/YYYY.',
      })
    }

    const tusdatosResponse = await launchTusdatosQuery({
      documentNumber,
      documentType: normalizedDocumentType,
      issueDate,
      webhookReference: `verifik-test:${req.user.userId}`,
    })

    return res.status(202).json({
      message: 'Consulta enviada correctamente a Tusdatos.',
      job_id: tusdatosResponse.jobid,
      status: 'PROCESSING',
      tusdatos: tusdatosResponse,
    })
  } catch (error) {
    return next(error)
  }
}