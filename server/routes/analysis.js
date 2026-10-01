const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET full class CO attainment analysis and grade distribution
router.get('/', (req, res) => {
  try {
    const analysis = db.getClassAnalysis();
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
