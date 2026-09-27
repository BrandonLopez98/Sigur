const { Query } = require('../../db');
const { serializeQueryProgress } = require('./serializers/queryProgress')

/**
 * El historial no necesita enviar el reporte completo de Tusdatos por cada
 * fila. Entregamos únicamente el progreso necesario para la interfaz; el
 * reporte detallado continúa protegido en GET /Query/:queryId/result.
 */
module.exports = async (user_id) => {
  try {
    // Si llega un id, buscamos únicamente el query con ese id
    if (user_id) {
      const queries = await Query.findAll({
        where: { user_id },
        // El historial siempre muestra la consulta más reciente primero.
        order: [['created_at', 'DESC']],
      });
      return queries.map(serializeQueryProgress)
    }
    // Si no llega ningún id, devolvemos todos los usuarios
    const querys = await Query.findAll({
      order: [['created_at', 'DESC']],
    });
    return querys.map(serializeQueryProgress);
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
}; 
