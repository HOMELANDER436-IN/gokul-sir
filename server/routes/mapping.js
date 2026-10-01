const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  try {
    const mappingData = db.getMapping();
    res.json(mappingData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const updated = db.updateMapping(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
