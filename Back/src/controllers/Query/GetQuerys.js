const { Query } = require('../../db');
const { serializeQueryProgress } = require('./serializers/queryProgress')

/**
 * El historial no necesita enviar el reporte completo de Tusdatos por cada
 * fila. Entregamos únicamente el progreso necesario para la interfaz; el
 * reporte detallado continúa protegido en GET /Query/:queryId/result.
 */
module.exports = async (user_id) => {
  try {
    if (!user_id) {
      const error = new Error('Usuario autenticado requerido.')
      error.status = 401
      throw error
    }

    const queries = await Query.findAll({
      where: { user_id },
      // El historial siempre muestra la consulta más reciente primero.
      order: [['created_at', 'DESC']],
    })

    return queries.map(serializeQueryProgress)
  } catch (error) {
    if (error.status) throw error
    throw new Error(`Error al obtener las consultas: ${error.message}`)
  }
}
