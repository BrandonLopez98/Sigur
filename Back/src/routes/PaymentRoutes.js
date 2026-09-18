const { Router } = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const postPaymentCheckout = require('../controllers/Payment/postPaymentCheckout')
const postWompiWebhook = require('../controllers/Payment/postWompiWebhook')
const getMyPaymentTransactions = require('../controllers/Payment/getMyPaymentTransactions')

const paymentRoutes = Router()

/**
 * Ruta temporal de desarrollo.
 * Wompi redirige a la URL pública de ngrok y este endpoint devuelve
 * al navegador local de Verifik.
 *
 * En producción FRONTEND_URL apuntará directamente al dominio público
 * del frontend, por lo que esta ruta no será necesaria.
 */
paymentRoutes.get('/return', (req, res) => {
  const localFrontendUrl =
    process.env.LOCAL_FRONTEND_URL || 'http://localhost:5173'

  return res.redirect(localFrontendUrl)
})

/**
 * Recibe los eventos firmados enviados por Wompi.
 * No lleva JWT porque Wompi es quien realiza la petición.
 */
paymentRoutes.post('/wompi/webhook', postWompiWebhook)

/**
 * Devuelve el historial de compras del usuario autenticado.
 */
paymentRoutes.get('/me', authenticateToken, getMyPaymentTransactions)

/**
 * Crea una transacción pendiente para el usuario autenticado.
 */
paymentRoutes.post('/checkout', authenticateToken, postPaymentCheckout)

module.exports = paymentRoutes