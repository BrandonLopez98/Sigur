const { CreditPackage } = require('../../db')
const verifikServiceInfo = require('../../config/verifikServiceInfo')

/**
 * Devuelve el catálogo comercial visible para los clientes.
 */
async function getPackages(req, res, next) {
  try {
    const packages = await CreditPackage.findAll({
      where: {
        status: 'active',
      },
      attributes: [
        'id',
        'name',
        'credits_amount',
        'price',
        'is_popular',
        'status',
      ],
      order: [['credits_amount', 'ASC']],
    })

    return res.status(200).json({
      service: verifikServiceInfo,
      packages,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = getPackages