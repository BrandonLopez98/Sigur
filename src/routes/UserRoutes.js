const express = require('express');
const router = express.Router();

const postUser = require('../controllers/User/PostUser');   // El unitario que ya te funciona
const postUsers = require('../controllers/User/PostUsers'); // El masivo que acabamos de crear

router.post('/', async (req, res) => {
  try {
    // Validar si el cuerpo es un arreglo (registro masivo)
    if (Array.isArray(req.body)) {
      const resultadoMasivo = await postUsers(req.body);
      return res.status(201).json(resultadoMasivo);
    } 
    
    // Si es un objeto único (registro individual)
    const { email, passwordHash, status, role } = req.body;

    if (!email || !passwordHash) {
      return res.status(400).json({ 
        error: 'El correo electrónico y la contraseña son obligatorios en el cuerpo de la solicitud.' 
      });
    }

    const nuevoUsuario = await postUser({ email, passwordHash, status, role });
    return res.status(201).json(nuevoUsuario);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;