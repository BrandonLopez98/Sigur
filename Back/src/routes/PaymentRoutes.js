const { Router } = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const postPaymentCheckout = require('../controllers/Payment/postPaymentCheckout')
const postWompiWebhook = require('../controllers/Payment/postWompiWebhook')

const paymentRoutes = Router()

/**
 * Recibe los eventos firmados enviados por Wompi.
 * No lleva JWT porque Wompi es quien hace la petición.
 */
paymentRoutes.post('/wompi/webhook', postWompiWebhook)

/**
 * Crea una transacción pendiente para el usuario autenticado.
 */
paymentRoutes.post('/checkout', authenticateToken, postPaymentCheckout)

module.exports = paymentRoutes