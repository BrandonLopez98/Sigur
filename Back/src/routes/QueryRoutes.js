const express = require('express')
const router = express.Router()

const postQuery = require('../controllers/Query/postQuery')
const getQuerys = require('../controllers/Query/getQuerys')
const applyQueryFilters = require('../controllers/Query/filters/applyQueryFilters')
const authenticateToken = require('../middlewares/authenticateToken')
const postTusdatosTest = require('../controllers/Query/postTusdatosTest')
const getTusdatosTestResult = require('../controllers/Query/getTusdatosTestResult')
const getQueryTusdatosStatus = require('../controllers/Query/getQueryTusdatosStatus')
const postTusdatosWebhook = require('../controllers/Query/postTusdatosWebhook')
const getQueryResult = require('../controllers/Query/getQueryResult')
const getQueryReportPdf = require('../controllers/Query/getQueryReportPdf')

/**
 * Tusdatos llama esta ruta al finalizar una consulta individual.
 * Tiene su propia autenticación; no usa el JWT de un usuario de Verifik.
 */
router.post('/tusdatos/webhook', postTusdatosWebhook)

/**
 * Devuelve únicamente las consultas del usuario autenticado.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const queries = await getQuerys(req.user.userId)
    const filteredQueries = applyQueryFilters(queries, req.query)

    return res.status(200).json(filteredQueries)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * Ruta temporal para verificar la conexión con Tusdatos Sandbox.
 * No descuenta créditos ni guarda una consulta final en nuestra base de datos.
 */
router.post(
  '/tusdatos/test',
  authenticateToken,
  postTusdatosTest
)

/**
 * Ruta temporal para consultar el estado y resultado de un job de Tusdatos.
 */
router.get(
  '/tusdatos/test/:jobId',
  authenticateToken,
  getTusdatosTestResult
)

/**
 * Consulta y actualiza el estado de una consulta real perteneciente al usuario.
 */
router.get(
  '/:queryId/status',
  authenticateToken,
  getQueryTusdatosStatus
)

/** Resultado detallado ya procesado para la vista de Verifik. */
router.get('/:queryId/result', authenticateToken, getQueryResult)

/** PDF privado: se descarga con el JWT del usuario autenticado. */
router.get('/:queryId/report/pdf', authenticateToken, getQueryReportPdf)

/**
 * Crea una consulta para el usuario autenticado.
 * user_id se toma del token; no llega desde el frontend.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { document_number } = req.body

    if (!document_number) {
      return res.status(400).json({
        error: 'document_number es obligatorio.',
      })
    }

    const queryCreated = await postQuery({
      ...req.body,
      user_id: req.user.userId,
    })

    return res.status(202).json(queryCreated)
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message })
  }
})

module.exports = router
