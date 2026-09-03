const express = require('express');
const router = express.Router();
const postQuery = require('../controllers/Query/postQuery');

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