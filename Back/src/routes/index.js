const { Router } = require('express');
const userRoutes = require('./UserRoutes'); // Importa tu archivo de rutas de usuario
const queryRoutes = require('./QueryRoutes')

const router = Router();

// Configurar los routers
router.use('/User', userRoutes);
router.use('/Query', queryRoutes);


module.exports = router;