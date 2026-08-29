const express = require('express');
const router = express.Router();

const postUsers = require('../controllers/User/PostUser'); // Ajusta la ruta según dónde guardes tu controlador

router.post('/', async (req, res) => {
  try {
    const { email, passwordHash, status, role } = req.body;

    // Validación básica en la ruta antes de tocar el controlador
    if (!email || !passwordHash) {
      return res.status(400).json({ 
        error: 'El correo electrónico y la contraseña son obligatorios en el cuerpo de la solicitud.' 
      });
    }

    const nuevoUsuario = await postUsers({ email, passwordHash, status, role });
    
    // Retornamos 201 (Created) cuando el registro es exitoso
    return res.status(201).json(nuevoUsuario);
  } catch (error) {
    // Si viene del throw new Error del controlador, devolvemos 400 si es de validación, o 500 general
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;