const { Router } = require('express');
const userRoutes = require('./UserRoutes'); // Importa tu archivo de rutas de usuario

const router = Router();

// Configurar los routers
router.use('/User', userRoutes);

module.exports = router;