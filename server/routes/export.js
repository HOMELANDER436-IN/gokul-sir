const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const db = require('../db/db');

router.get('/excel', (req, res) => {
  try {
    const students = db.getAllStudents();
    const analysis = db.getClassAnalysis();
    const mappingData = db.getMapping();
    const overallData = db.getOverall();

    const wb = XLSX.utils.book_new();

    // 1. Student Results Sheet
    const studentRows = students.map(s => ({
      'Roll No': s.rollNo,
      'Student Name': s.name,
      'Register No': s.registerNo,
      'Internal Mark (50)': s.internalMark,
      'Grade': s.assessment?.grade || '',
      'University Mark (100)': s.assessment?.universityMark ?? '',
      'CO1': Number((s.assessment?.co1 ?? 0).toFixed(2)),
      'CO2': Number((s.assessment?.co2 ?? 0).toFixed(2)),
      'CO3': Number((s.assessment?.co3 ?? 0).toFixed(2)),
      'CO4': Number((s.assessment?.co4 ?? 0).toFixed(2)),
      'CO5': Number((s.assessment?.co5 ?? 0).toFixed(2)),
      'Continuous Evaluation': Number((s.assessment?.continuousEvaluation ?? 0).toFixed(2))
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentRows);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Results');

    // 2. CO Attainment Sheet
    const attainmentRows = [
      {
        'Metric': 'Attained Students (55-100)',
        'CO1': analysis.summary.co1.attainedCount,
        'CO2': analysis.summary.co2.attainedCount,
        'CO3': analysis.summary.co3.attainedCount,
        'CO4': analysis.summary.co4.attainedCount,
        'CO5': analysis.summary.co5.attainedCount,
        'Continuous Evaluation': analysis.summary.continuousEvaluation.attainedCount
      },
      {
        'Metric': 'Total Students / Denominator',
        'CO1': analysis.summary.co1.totalStudents,
        'CO2': analysis.summary.co2.totalStudents,
        'CO3': analysis.summary.co3.totalStudents,
        'CO4': analysis.summary.co4.totalStudents,
        'CO5': analysis.summary.co5.totalStudents,
        'Continuous Evaluation': analysis.summary.continuousEvaluation.denominator
      },
      {
        'Metric': 'Attainment Percentage',
        'CO1': `${analysis.summary.co1.percentage}%`,
        'CO2': `${analysis.summary.co2.percentage}%`,
        'CO3': `${analysis.summary.co3.percentage}%`,
        'CO4': `${analysis.summary.co4.percentage}%`,
        'CO5': `${analysis.summary.co5.percentage}%`,
        'Continuous Evaluation': `${analysis.summary.continuousEvaluation.percentage}%`
      },
      {
        'Metric': 'Attainment Level (1-3)',
        'CO1': analysis.summary.co1.level || 'No Attainment',
        'CO2': analysis.summary.co2.level || 'No Attainment',
        'CO3': analysis.summary.co3.level || 'No Attainment',
        'CO4': analysis.summary.co4.level || 'No Attainment',
        'CO5': analysis.summary.co5.level || 'No Attainment',
        'Continuous Evaluation': analysis.summary.continuousEvaluation.level || 'No Attainment'
      }
    ];
    const wsAttainment = XLSX.utils.json_to_sheet(attainmentRows);
    XLSX.utils.book_append_sheet(wb, wsAttainment, 'CO Attainment');

    // 3. Assessment Tools Sheet
    const tools = analysis.assessmentTools;
    const toolsRows = [
      { 'Assessment Tool': 'Board / University Exam', ...tools.board },
      { 'Assessment Tool': 'Survey', ...tools.survey },
      { 'Assessment Tool': 'Final CO', ...tools.final }
    ];
    const wsTools = XLSX.utils.json_to_sheet(toolsRows);
    XLSX.utils.book_append_sheet(wb, wsTools, 'Assessment Tools');

    // 4. PO / PSO Mapping Sheet
    const outcomes = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 'PSO1', 'PSO2', 'PSO3'];
    const mapRows = Object.keys(mappingData.mapping).map(co => {
      const row = { 'CO': co };
      outcomes.forEach(out => {
        row[out] = mappingData.mapping[co][out] ?? 0;
      });
      return row;
    });
    // Add Original Attainment row
    const origRow = { 'CO': 'Original Attainment' };
    outcomes.forEach(out => {
      origRow[out] = mappingData.originalAttainment[out] !== null ? Number(mappingData.originalAttainment[out].toFixed(3)) : 'N/A';
    });
    mapRows.push(origRow);
    const wsMap = XLSX.utils.json_to_sheet(mapRows);
    XLSX.utils.book_append_sheet(wb, wsMap, 'PO PSO Mapping');

    // 5. Final PO/PSO Attainment Sheet
    const finalAttainRows = Object.keys(mappingData.attainedMatrix).map(co => {
      const row = { 'CO': co };
      outcomes.forEach(out => {
        row[out] = Number((mappingData.attainedMatrix[co][out] ?? 0).toFixed(3));
      });
      return row;
    });
    const finalRow = { 'CO': 'Final Attainment' };
    outcomes.forEach(out => {
      finalRow[out] = mappingData.finalAttainment[out] !== null ? Number(mappingData.finalAttainment[out].toFixed(3)) : 'N/A';
    });
    finalAttainRows.push(finalRow);
    const wsFinal = XLSX.utils.json_to_sheet(finalAttainRows);
    XLSX.utils.book_append_sheet(wb, wsFinal, 'PO PSO Attainment');

    // 6. OVERALL CO Sheet
    const overallCos = ['ESL120.1', 'ESL120.2', 'ESL120.3', 'ESL120.4', 'ESL120.5', 'ESL120.6', 'ESL120.7', 'ESL120.8'];
    const overallRows = overallCos.map(co => {
      const row = {
        'Course Outcome': co,
        'Target CO': overallData.mapping[co]?.targetCO ?? 3,
        'Final Attained CO': overallData.tools?.final?.[co] ?? 3
      };
      outcomes.forEach(out => {
        row[out] = overallData.mapping[co]?.[out] ?? 0;
      });
      return row;
    });
    const overallFinalRow = { 'Course Outcome': 'Final PO/PSO Attainment' };
    outcomes.forEach(out => {
      overallFinalRow[out] = overallData.finalAttainment[out] !== null ? Number(overallData.finalAttainment[out].toFixed(3)) : 'N/A';
    });
    overallRows.push(overallFinalRow);
    const wsOverall = XLSX.utils.json_to_sheet(overallRows);
    XLSX.utils.book_append_sheet(wb, wsOverall, 'OVERALL CO');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="CO_Attainment_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to generate Excel export' });
  }
});

module.exports = router;
