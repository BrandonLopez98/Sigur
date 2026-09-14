const express = require('express');
const router = express.Router();

const postQuery = require('../controllers/Query/postQuery');
const getQuerys = require('../controllers/Query/getQuerys');
const applyQueryFilters = require('../controllers/Query/filters/applyQueryFilters');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * Devuelve únicamente las consultas del usuario autenticado.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const queries = await getQuerys(req.user.userId);
    const filteredQueries = applyQueryFilters(queries, req.query);

    return res.status(200).json(filteredQueries);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Crea una consulta para el usuario autenticado.
 * user_id se toma del token; no llega desde el frontend.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { document_number } = req.body;

    if (!document_number) {
      return res.status(400).json({
        error: 'document_number es obligatorio.',
      });
    }

    const queryCreated = await postQuery({
      ...req.body,
      user_id: req.user.userId,
    });

    return res.status(201).json(queryCreated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;