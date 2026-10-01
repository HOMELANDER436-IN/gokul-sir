const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { calculateAllStudentMetrics } = require('../calculation');

// GET all students
router.get('/', (req, res) => {
  try {
    const students = db.getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET preview calculation before saving
router.post('/preview', (req, res) => {
  try {
    const { internalMark, grade } = req.body;
    const settings = db.getSettings();
    const metrics = calculateAllStudentMetrics(
      internalMark,
      grade,
      settings.gradeMap,
      { totalMax: settings.totalMax, ceMax: settings.ceMax }
    );
    res.json(metrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', (req, res) => {
  try {
    const student = db.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', (req, res) => {
  try {
    const created = db.createStudent(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST teacher grade change (primary quick-action)
router.post('/:id/grade', (req, res) => {
  try {
    const { grade } = req.body;
    const updated = db.updateStudentGrade(req.params.id, grade);
    const analysis = db.getClassAnalysis();
    res.json({
      student: updated,
      analysis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', (req, res) => {
  try {
    const removed = db.deleteStudent(req.params.id);
    res.json({ success: true, removed });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST bulk update
router.post('/bulk-update', (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }
    const results = db.bulkUpdateGrades(updates);
    const analysis = db.getClassAnalysis();
    res.json({
      updatedCount: results.length,
      students: results,
      analysis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
