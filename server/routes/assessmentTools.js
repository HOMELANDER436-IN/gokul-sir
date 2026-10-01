const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  try {
    const tools = db.getAssessmentTools();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const updated = db.updateAssessmentTools(req.body);
    const mapping = db.getMapping();
    res.json({
      tools: updated,
      mapping
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
