const { Query } = require('../../db')

/**
 * El PDF original del proveedor no se entrega porque contiene identidad visual
 * de un tercero. La vista Verifik ofrece impresión limpia y guardado como PDF.
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
        error: 'El PDF todavía no está disponible para esta consulta.',
      })
    }

    return res.status(410).json({
      error: 'Este formato fue reemplazado por el reporte Verifik. Ábrelo y usa “Imprimir o guardar PDF”.',
    })
  } catch (error) {
    return next(error)
  }
}
