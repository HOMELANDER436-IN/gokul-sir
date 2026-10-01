const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../db/db');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    let studentsImported = 0;

    // Check sheets
    const sheetName = wb.SheetNames.find(n => n.includes('CO Calculation') || n.includes('Student') || n.includes('Sheet1')) || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Look for rows with roll number, name, internal, grade
    const importedList = [];

    for (let r = 0; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length < 2) continue;

      // Check if row[0] is numeric roll number
      const rollNum = Number(row[0]);
      if (!isNaN(rollNum) && rollNum > 0 && rollNum < 1000) {
        const rawName = String(row[1] || '').trim();
        let name = rawName;
        let regNo = '';
        if (rawName.includes(' - ')) {
          const parts = rawName.split(' - ');
          name = parts[0].trim();
          regNo = parts[1].trim();
        } else if (rawName.includes('-')) {
          const parts = rawName.split('-');
          name = parts[0].trim();
          regNo = parts[1].trim();
        }

        const internalMark = Number(row[2]) || 0;
        const grade = String(row[3] || '').trim();

        if (name) {
          importedList.push({
            rollNo: rollNum,
            name,
            registerNo: regNo || `REG${rollNum}`,
            internalMark,
            grade
          });
        }
      }
    }

    if (importedList.length === 0) {
      return res.status(400).json({ error: 'Could not detect valid student records in the uploaded file.' });
    }

    // Merge or replace students
    importedList.forEach(item => {
      const existing = db.getAllStudents().find(s => s.rollNo === item.rollNo || s.registerNo === item.registerNo);
      if (existing) {
        db.updateStudent(existing.id, item);
      } else {
        db.createStudent(item);
      }
      studentsImported++;
    });

    res.json({
      success: true,
      message: `Successfully processed ${studentsImported} student records from ${req.file.originalname}`,
      totalStudents: db.getAllStudents().length
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: `Import failed: ${err.message}` });
  }
});

module.exports = router;
