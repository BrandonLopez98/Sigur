const { Router } = require('express');
const userRoutes = require('./UserRoutes'); // Importa tu archivo de rutas de usuario
const queryRoutes = require('./QueryRoutes')
const authRoutes = require('./AuthRoutes');
const packageRoutes = require('./PackageRoutes')
const paymentRoutes = require('./PaymentRoutes')
const creditRoutes = require('./CreditRoutes')

const router = Router();

// Configurar los routers
router.use('/Auth', authRoutes);
router.use('/User', userRoutes);
router.use('/Query', queryRoutes);
router.use('/Packages', packageRoutes)
router.use('/Payments', paymentRoutes)
router.use('/Credits', creditRoutes)

module.exports = router;
