const express = require('express');
const router = express.Router();

const postUser = require('../controllers/User/PostUser');   // El unitario que ya te funciona
const postUsers = require('../controllers/User/PostUsers'); // El masivo que acabamos de crear
const getUsers = require('../controllers/User/getUsers')

router.get('/', async (req, res) => {
  try {
    const { email } = req.query; // Capturamos el email si viene en la URL (ej: /user?email=prueba@correo.com)
    
    const resultado = await getUsers(email);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

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