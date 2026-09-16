const { Router } = require('express')
const getPackages = require('../controllers/Package/getPackages')
const postPackage = require('../controllers/Package/postPackage')
const putPackage = require('../controllers/Package/putPackage')
const authenticateToken = require('../middlewares/authenticateToken')
const authorizeRoles = require('../middlewares/authorizeRoles')

const packageRoutes = Router()

// Público: el cliente puede ver paquetes disponibles sin iniciar sesión.
packageRoutes.get('/', getPackages)

// Administrativo: modifica el catálogo de paquetes.
packageRoutes.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  postPackage
)

packageRoutes.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  putPackage
)

module.exports = packageRoutes