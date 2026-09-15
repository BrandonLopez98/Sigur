const express = require('express');
const login = require('../controllers/Auth/Login');
const authenticateToken = require('../middlewares/authenticateToken')
const getCurrentUser = require('../controllers/Auth/getCurrentUser')
const updateCurrentUserProfile = require('../controllers/Auth/updateCurrentUserProfile')


const router = express.Router();

/**
 * Inicia sesión con correo y contraseña.
 *
 * Body esperado:
 * {
 *   "email": "esteban@exale.com",
 *   "password": "..."
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const result = await login(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'No fue posible iniciar sesión.',
    });
  }
});

/**
 * Devuelve el usuario que corresponde al token enviado.
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId)
    return res.status(200).json(user)
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'No fue posible obtener el usuario.',
    })
  }
})

/**
 * Crea o actualiza el perfil del usuario autenticado.
 */
router.put('/me/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await updateCurrentUserProfile(
      req.user.userId,
      req.body
    )

    return res.status(200).json(profile)
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'No fue posible actualizar el perfil.',
    })
  }
})

module.exports = router;