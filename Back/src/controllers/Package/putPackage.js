const { CreditPackage } = require('../../db')

/**
 * Actualiza parcialmente un paquete existente.
 */
async function putPackage(req, res, next) {
  try {
    const { id } = req.params
    const { name, credits_amount, price, status } = req.body

    const packageToUpdate = await CreditPackage.findByPk(id)

    if (!packageToUpdate) {
      return res.status(404).json({
        error: 'Paquete no encontrado.',
      })
    }

    const changes = {}

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          error: 'El nombre no puede estar vacío.',
        })
      }

      changes.name = name.trim()
    }

    if (credits_amount !== undefined) {
      const creditsAmount = Number(credits_amount)

      if (!Number.isInteger(creditsAmount) || creditsAmount < 1) {
        return res.status(400).json({
          error: 'credits_amount debe ser un número entero mayor que cero.',
        })
      }

      changes.credits_amount = creditsAmount
    }

    if (price !== undefined) {
      const packagePrice = Number(price)

      if (!Number.isFinite(packagePrice) || packagePrice < 0) {
        return res.status(400).json({
          error: 'price debe ser un número válido.',
        })
      }

      changes.price = packagePrice
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          error: 'El estado debe ser active o inactive.',
        })
      }

      changes.status = status
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        error: 'Envía al menos un dato para actualizar.',
      })
    }

    await packageToUpdate.update(changes)

    return res.status(200).json(packageToUpdate)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Ya existe un paquete con ese nombre.',
      })
    }

    next(error)
  }
}

module.exports = putPackage