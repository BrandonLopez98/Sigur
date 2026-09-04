const express = require('express');
const router = express.Router();

const postQuery = require('../controllers/Query/postQuery');
const getQuerys = require('../controllers/Query/getQuerys');

router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    const resultado = await getQuerys(id);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, document_number } = req.body;

    if (!user_id || !document_number) {
      return res.status(400).json({ error: 'user_id y document_number son obligatorios.' });
    }

    const queryCreada = await postQuery(req.body);

    return res.status(201).json(queryCreada);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
