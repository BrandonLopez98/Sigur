const { Router } = require('express');
const userRoutes = require('./UserRoutes'); // Importa tu archivo de rutas de usuario
const queryRoutes = require('./QueryRoutes')
const authRoutes = require('./AuthRoutes');

const router = Router();

// Configurar los routers
router.use('/Auth', authRoutes);
router.use('/User', userRoutes);
router.use('/Query', queryRoutes);


module.exports = router;