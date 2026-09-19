const crypto = require('crypto')
const { CreditPackage, PaymentTransaction } = require('../../db')

/**
 * Crea una transacción pendiente y entrega la configuración segura
 * que el frontend necesita para abrir el Checkout Web de Wompi.
 */
async function postPaymentCheckout(req, res, next) {
  try {
    const { package_id } = req.body

    if (!package_id) {
      return res.status(400).json({
        error: 'Debes seleccionar un paquete.',
      })
    }

    if (
      !process.env.WOMPI_PUBLIC_KEY ||
      !process.env.WOMPI_INTEGRITY_SECRET ||
      !process.env.FRONTEND_URL
    ) {return res.status(500).json({
        error: 'Las credenciales de Wompi Sandbox no están configuradas.',
      })
    }

    const creditPackage = await CreditPackage.findOne({
      where: {
        id: package_id,
        status: 'active',
      },
    })

    if (!creditPackage) {
      return res.status(404).json({
        error: 'El paquete seleccionado no existe o no está disponible.',
      })
    }

    const reference = `VERIFIK-${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`

    // Wompi recibe el monto en centavos. Ej.: $62.900 COP = 6.290.000 centavos.
    const amountInCents = Math.round(Number(creditPackage.price) * 100)

    // La firma se genera solo en el backend para no exponer el secreto.
    const integritySignature = crypto
      .createHash('sha256')
      .update(
        `${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET}`
      )
      .digest('hex')

    const paymentTransaction = await PaymentTransaction.create({
      user_id: req.user.userId,
      package_id: creditPackage.id,
      reference,
      amount_paid: creditPackage.price,
      currency: 'COP',
      status: 'PENDING',
      credits_amount: creditPackage.credits_amount,
    })

    return res.status(201).json({
      message: 'Transacción de pago creada. Pendiente de confirmación.',
      payment: {
        id: paymentTransaction.id,
        reference: paymentTransaction.reference,
        amount_paid: paymentTransaction.amount_paid,
        currency: paymentTransaction.currency,
        status: paymentTransaction.status,
        credits_amount: paymentTransaction.credits_amount,
        package: {
          id: creditPackage.id,
          name: creditPackage.name,
        },
      },
      checkout: {
        publicKey: process.env.WOMPI_PUBLIC_KEY,
        currency: 'COP',
        amountInCents,
        reference,
        integritySignature,
        redirectUrl: process.env.FRONTEND_URL,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = postPaymentCheckout