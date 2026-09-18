const {
  getTusdatosQueryResult,
} = require('../../services/tusdatosApi')

/**
 * Ruta temporal para consultar el estado de un job lanzado en Tusdatos.
 * No modifica créditos ni persiste resultados en Verifik.
 */
module.exports = async (req, res, next) => {
  try {
    const { jobId } = req.params

    if (!jobId) {
      return res.status(400).json({
        error: 'jobId es obligatorio.',
      })
    }

    const tusdatosResult = await getTusdatosQueryResult(jobId)

    return res.status(200).json({
      message: 'Resultado consultado correctamente en Tusdatos.',
      job_id: jobId,
      status: tusdatosResult.estado || 'PROCESSING',
      result: tusdatosResult,
    })
  } catch (error) {
    /**
     * Información temporal para diagnosticar la respuesta de Tusdatos Sandbox.
     * No expone credenciales ni datos internos de Verifik.
     */
    return res.status(error.status || 502).json({
      error: error.message,
      provider_status: error.status || null,
      provider_response: error.providerResponse || null,
    })
  }
}
