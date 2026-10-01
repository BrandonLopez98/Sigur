const express = require('express')
const router = express.Router()

const postUser = require('../controllers/User/PostUser')
const getUsers = require('../controllers/User/getUsers')
const authenticateToken = require('../middlewares/authenticateToken')
const authorizeRoles = require('../middlewares/authorizeRoles')

/**
 * El directorio de usuarios contiene datos privados y solo está disponible
 * para administradores autenticados.
 */
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const resultado = await getUsers(req.query.email)
    return res.status(200).json(resultado)
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message })
  }
})

/**
 * Registro público de una cuenta cliente. El solicitante no puede elegir su
 * rol, estado ni utilizar este endpoint como cargador masivo.
 */
router.post('/', async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'El registro masivo no está disponible en esta ruta.',
      })
    }

    const { email, password, role, status } = req.body || {}

    if (role !== undefined || status !== undefined) {
      return res.status(400).json({
        error: 'El rol y el estado de la cuenta son administrados por Verifik.',
      })
    }

    if (!email || !password) {
      return res.status(400).json({
        error: 'El correo electrónico y la contraseña son obligatorios.',
      })
    }

    const nuevoUsuario = await postUser({ email, password })

    return res.status(201).json(nuevoUsuario)

  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message })
  }
})

module.exports = router
