const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  try {
    const overallData = db.getOverall();
    res.json(overallData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/mapping', (req, res) => {
  try {
    const updated = db.updateOverallMapping(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/tools', (req, res) => {
  try {
    const updated = db.updateOverallTools(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
