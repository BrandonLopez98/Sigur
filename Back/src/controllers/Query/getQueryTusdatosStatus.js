const { Query } = require('../../db')
const { synchronizeTusdatosQuery } = require('../../services/tusdatosQueryLifecycle')

/**
 * Actualiza inmediatamente el estado de una consulta propia. El monitor ya
 * ejecuta este proceso en segundo plano; esta ruta reutiliza la misma lógica.
 */
module.exports = async (req, res, next) => {
  try {
    const query = await Query.findOne({
      where: { id: req.params.queryId, user_id: req.user.userId },
    })

    if (!query) {
      return res.status(404).json({ error: 'Consulta no encontrada.' })
    }

    const outcome = await synchronizeTusdatosQuery(query.id)
    const currentQuery = outcome.query || await Query.findByPk(query.id)

    if (outcome.state === 'missing') {
      return res.status(404).json({ error: 'Consulta no encontrada.' })
    }

    return res.status(outcome.state === 'completed' || outcome.state === 'failed' ? 200 : 202).json({
      query: currentQuery,
      provider_status: outcome.state,
      refunded: Boolean(outcome.refunded),
    })
  } catch (error) {
    return next(error)
  }
}
