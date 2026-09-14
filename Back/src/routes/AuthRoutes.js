const express = require('express');
const login = require('../controllers/Auth/Login');

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

module.exports = router;