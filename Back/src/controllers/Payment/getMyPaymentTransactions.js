const { PaymentTransaction, CreditPackage } = require('../../db')

/**
 * Obtiene exclusivamente las transacciones de compra del usuario autenticado.
 */
async function getMyPaymentTransactions(req, res, next) {
  try {
    const transactions = await PaymentTransaction.findAll({
      where: {
        user_id: req.user.userId,
      },
      attributes: [
        'id',
        'reference',
        'amount_paid',
        'currency',
        'status',
        'payment_method',
        'credits_amount',
        'credited_at',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: CreditPackage,
          as: 'package',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    return res.status(200).json({
      total: transactions.length,
      transactions,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = getMyPaymentTransactions