const { CreditPackage, conn } = require('../../db')

/**
 * Crea un paquete de créditos.
 * Solo debe ejecutarlo un administrador.
 */
async function postPackage(req, res, next) {
  try {
    const {
      name,
      credits_amount,
      price,
      is_popular = false,
      status = 'active',
    } = req.body

    const creditsAmount = Number(credits_amount)
    const packagePrice = Number(price)

    if (
      !name?.trim() ||
      !Number.isInteger(creditsAmount) ||
      creditsAmount < 1 ||
      !Number.isFinite(packagePrice) ||
      packagePrice < 0
    ) {
      return res.status(400).json({
        error: 'Envía nombre, créditos válidos y precio válido.',
      })
    }

    if (typeof is_popular !== 'boolean') {
      return res.status(400).json({
        error: 'is_popular debe ser true o false.',
      })
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        error: 'El estado debe ser active o inactive.',
      })
    }

    const newPackage = await conn.transaction(async (transaction) => {
      // Solo un paquete puede llevar la etiqueta “Más popular”.
      if (is_popular) {
        await CreditPackage.update(
          { is_popular: false },
          {
            where: { is_popular: true },
            transaction,
          }
        )
      }

      return CreditPackage.create(
        {
          name: name.trim(),
          credits_amount: creditsAmount,
          price: packagePrice,
          is_popular,
          status,
        },
        { transaction }
      )
    })

    return res.status(201).json(newPackage)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Ya existe un paquete con ese nombre.',
      })
    }

    next(error)
  }
}

module.exports = postPackage