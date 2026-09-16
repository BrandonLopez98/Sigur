const { CreditPackage } = require('../../db')

/**
 * Devuelve los paquetes que están disponibles para compra.
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
        'created_at',
      ],
      order: [['price', 'ASC']],
    })

    return res.status(200).json(packages)
  } catch (error) {
    next(error)
  }
}

module.exports = getPackages