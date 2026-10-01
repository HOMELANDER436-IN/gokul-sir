const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    const analysis = db.getClassAnalysis();
    res.json({
      settings: updated,
      analysis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/reset', (req, res) => {
  try {
    const reset = db.resetSettingsToDefault();
    const analysis = db.getClassAnalysis();
    res.json({
      settings: reset,
      analysis,
      message: 'Settings reset to original workbook defaults'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
