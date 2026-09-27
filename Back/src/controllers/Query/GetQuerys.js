const { Query } = require('../../db');

/**
 * El historial no necesita enviar el reporte completo de Tusdatos por cada
 * fila. Entregamos únicamente el progreso necesario para la interfaz; el
 * reporte detallado continúa protegido en GET /Query/:queryId/result.
 */
function serializeQueryForHistory(query) {
  const data = query.toJSON()
  const response = data.provider_response || {}
  const rawPercentage = response.percentage ?? response.result?.percentage
  const parsedPercentage = Number(rawPercentage)
  const providerPercentage = Number.isFinite(parsedPercentage)
    ? Math.max(0, Math.min(99, Math.round(parsedPercentage)))
    : null

  let progress
  if (data.status === 'completed') {
    progress = { percentage: 100, estimated: false, label: 'Verificación finalizada' }
  } else if (data.status === 'failed') {
    progress = { percentage: 0, estimated: false, label: 'Verificación no finalizada' }
  } else if (providerPercentage !== null) {
    progress = {
      percentage: providerPercentage,
      estimated: false,
      label: `Verificación en curso: ${providerPercentage}% de avance`,
    }
  } else if (data.status === 'processing') {
    progress = { percentage: 15, estimated: true, label: 'La verificación está en curso' }
  } else {
    progress = { percentage: 5, estimated: true, label: 'Preparando la verificación' }
  }

  delete data.provider_response
  delete data.provider_error

  return { ...data, progress }
}

module.exports = async (user_id) => {
  try {
    // Si llega un id, buscamos únicamente el query con ese id
    if (user_id) {
      const queries = await Query.findAll({
        where: { user_id },
        // El historial siempre muestra la consulta más reciente primero.
        order: [['created_at', 'DESC']],
      });
      return queries.map(serializeQueryForHistory)
    }
    // Si no llega ningún id, devolvemos todos los usuarios
    const querys = await Query.findAll({
      order: [['created_at', 'DESC']],
    });
    return querys.map(serializeQueryForHistory);
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
}; 
