const { CreditMovement } = require('../../db')

function parsePositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

/**
 * Devuelve el libro de movimientos del usuario autenticado.
 * Nunca acepta user_id por parámetros para evitar consultar saldos ajenos.
 */
module.exports = async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, Number.MAX_SAFE_INTEGER)
    const limit = parsePositiveInteger(req.query.limit, 20, 100)
    const offset = (page - 1) * limit

    const { count, rows } = await CreditMovement.findAndCountAll({
      where: { user_id: req.user.userId },
      attributes: [
        'id',
        'type',
        'amount',
        'balance_after',
        'source_type',
        'source_id',
        'reference',
        'description',
        'metadata',
        'created_at',
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    })

    return res.status(200).json({
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
      movements: rows,
    })
  } catch (error) {
    return next(error)
  }
}
