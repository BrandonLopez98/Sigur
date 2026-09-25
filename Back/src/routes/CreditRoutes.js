const { Router } = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const getMyCreditMovements = require('../controllers/Credit/getMyCreditMovements')

const creditRoutes = Router()

/** Historial contable del usuario que inició sesión. */
creditRoutes.get('/movements', authenticateToken, getMyCreditMovements)

module.exports = creditRoutes
