const { Router } = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const authorizeRoles = require('../middlewares/authorizeRoles')
const { getHealth, getHealthMetrics } = require('../controllers/Health/getHealth')

const healthRoutes = Router()

healthRoutes.get('/', getHealth)
healthRoutes.get('/metrics', authenticateToken, authorizeRoles('admin'), getHealthMetrics)

module.exports = healthRoutes
