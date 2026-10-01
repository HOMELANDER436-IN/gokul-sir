const fs = require('fs');
const path = require('path');
const {
  getDefaultGradeMap,
  DEFAULT_CO_THRESHOLDS,
  DEFAULT_CE_THRESHOLDS,
  DEFAULT_ASSESSMENT_TOOLS,
  DEFAULT_MAPPING,
  DEFAULT_OVERALL_TOOLS,
  DEFAULT_OVERALL_MAPPING,
  calculateAllStudentMetrics,
  calculateClassSummary,
  calculateAllFinalCOs,
  calculateOriginalPOPSOAttainment,
  calculateAttainedMatrixAndFinal,
  calculateOverallOriginalAttainment,
  calculateOverallFinalAttainment
} = require('../calculation');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const WORKBOOK_DATA_FILE = path.join(__dirname, '..', '..', 'scripts', 'workbookData.json');

class DatabaseService {
  constructor() {
    this.data = {
      students: [],
      settings: {
        gradeMap: getDefaultGradeMap(),
        coThresholds: { ...DEFAULT_CO_THRESHOLDS },
        ceThresholds: { ...DEFAULT_CE_THRESHOLDS },
        internalMax: 50,
        universityMax: 100,
        totalMax: 150,
        ceMax: 30,
        assessmentTools: JSON.parse(JSON.stringify(DEFAULT_ASSESSMENT_TOOLS)),
        overallTools: JSON.parse(JSON.stringify(DEFAULT_OVERALL_TOOLS))
      },
      mapping: JSON.parse(JSON.stringify(DEFAULT_MAPPING)),
      overallMapping: JSON.parse(JSON.stringify(DEFAULT_OVERALL_MAPPING)),
      auditLogs: []
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[DB] Loaded existing database with ${this.data.students.length} students.`);
        return;
      } catch (err) {
        console.error('[DB] Failed reading db file, re-seeding:', err.message);
      }
    }

    this.seedFromWorkbook();
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving database:', err.message);
    }
  }

  seedFromWorkbook() {
    console.log('[DB] Seeding database from initial workbook data...');
    if (fs.existsSync(WORKBOOK_DATA_FILE)) {
      try {
        const wb = JSON.parse(fs.readFileSync(WORKBOOK_DATA_FILE, 'utf8'));
        const coCalc = wb['CO Calculation'];
        if (coCalc && Array.isArray(coCalc.students)) {
          this.data.students = coCalc.students.map((s, idx) => {
            const metrics = calculateAllStudentMetrics(
              s.internalMark,
              s.grade,
              this.data.settings.gradeMap,
              { totalMax: this.data.settings.totalMax, ceMax: this.data.settings.ceMax }
            );

            return {
              id: `std_${s.rollNo || idx + 1}`,
              rollNo: Number(s.rollNo) || idx + 1,
              name: s.name || s.rawName || `Student ${idx + 1}`,
              registerNo: s.registerNo || `REG${idx + 1}`,
              internalMark: Number(s.internalMark) || 0,
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              assessment: {
                grade: s.grade || '',
                universityMark: metrics.universityMark,
                co1: metrics.co1,
                co2: metrics.co2,
                co3: metrics.co3,
                co4: metrics.co4,
                co5: metrics.co5,
                continuousEvaluation: metrics.continuousEvaluation,
                updatedAt: new Date().toISOString()
              }
            };
          });

          if (coCalc.assessmentTools) {
            this.data.settings.assessmentTools = {
              board: coCalc.assessmentTools.board,
              survey: coCalc.assessmentTools.survey
            };
          }

          if (coCalc.originalMapping) {
            this.data.mapping = coCalc.originalMapping;
          }
        }

        const overall = wb['OVERALL CO'];
        if (overall) {
          if (overall.assessmentTools) {
            this.data.settings.overallTools = overall.assessmentTools;
          }
          if (overall.originalMapping) {
            this.data.overallMapping = overall.originalMapping;
          }
        }

        this.save();
        console.log(`[DB] Successfully seeded ${this.data.students.length} students from workbook.`);
        return;
      } catch (err) {
        console.error('[DB] Failed parsing workbookData.json:', err.message);
      }
    }

    this.save();
  }

  // --- Student operations ---

  getAllStudents() {
    return this.data.students.sort((a, b) => a.rollNo - b.rollNo);
  }

  getStudentById(id) {
    return this.data.students.find(s => s.id === id || String(s.rollNo) === String(id));
  }

  createStudent(payload) {
    const { name, registerNo, rollNo, internalMark, grade } = payload;
    const existingRoll = this.data.students.find(s => s.rollNo === Number(rollNo));
    if (existingRoll) {
      throw new Error(`Roll number ${rollNo} already exists.`);
    }

    const nextRoll = Number(rollNo) || (Math.max(0, ...this.data.students.map(s => s.rollNo)) + 1);
    const metrics = calculateAllStudentMetrics(
      internalMark,
      grade || '',
      this.data.settings.gradeMap,
      { totalMax: this.data.settings.totalMax, ceMax: this.data.settings.ceMax }
    );

    const newStudent = {
      id: `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      rollNo: nextRoll,
      name: String(name || '').trim(),
      registerNo: String(registerNo || '').trim(),
      internalMark: Number(internalMark) || 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assessment: {
        grade: grade || '',
        universityMark: metrics.universityMark,
        co1: metrics.co1,
        co2: metrics.co2,
        co3: metrics.co3,
        co4: metrics.co4,
        co5: metrics.co5,
        continuousEvaluation: metrics.continuousEvaluation,
        updatedAt: new Date().toISOString()
      }
    };

    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }

  updateStudent(id, payload) {
    const student = this.getStudentById(id);
    if (!student) {
      throw new Error(`Student with id ${id} not found.`);
    }

    const oldGrade = student.assessment.grade;
    const oldUniv = student.assessment.universityMark;

    if (payload.name !== undefined) student.name = String(payload.name).trim();
    if (payload.registerNo !== undefined) student.registerNo = String(payload.registerNo).trim();
    if (payload.rollNo !== undefined) student.rollNo = Number(payload.rollNo);
    if (payload.internalMark !== undefined) student.internalMark = Number(payload.internalMark);
    if (payload.active !== undefined) student.active = Boolean(payload.active);

    const targetGrade = payload.grade !== undefined ? payload.grade : student.assessment.grade;

    const metrics = calculateAllStudentMetrics(
      student.internalMark,
      targetGrade,
      this.data.settings.gradeMap,
      { totalMax: this.data.settings.totalMax, ceMax: this.data.settings.ceMax }
    );

    student.assessment = {
      grade: targetGrade,
      universityMark: metrics.universityMark,
      co1: metrics.co1,
      co2: metrics.co2,
      co3: metrics.co3,
      co4: metrics.co4,
      co5: metrics.co5,
      continuousEvaluation: metrics.continuousEvaluation,
      updatedAt: new Date().toISOString()
    };
    student.updatedAt = new Date().toISOString();

    // Audit log if grade changed
    if (payload.grade !== undefined && payload.grade !== oldGrade) {
      this.recordAuditLog({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        registerNo: student.registerNo,
        oldGrade,
        newGrade: targetGrade,
        oldUniversityMark: oldUniv,
        newUniversityMark: metrics.universityMark
      });
    }

    this.save();
    return student;
  }

  updateStudentGrade(id, newGrade) {
    return this.updateStudent(id, { grade: newGrade });
  }

  deleteStudent(id) {
    const idx = this.data.students.findIndex(s => s.id === id || String(s.rollNo) === String(id));
    if (idx === -1) {
      throw new Error(`Student ${id} not found.`);
    }
    const removed = this.data.students.splice(idx, 1)[0];
    this.save();
    return removed;
  }

  bulkUpdateGrades(updates) {
    // updates: [{ id, grade, internalMark }]
    const results = [];
    updates.forEach(u => {
      try {
        const updated = this.updateStudent(u.id, u);
        results.push(updated);
      } catch (err) {
        console.error(`Failed updating student ${u.id}:`, err.message);
      }
    });
    this.save();
    return results;
  }

  recordAuditLog(entry) {
    const log = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(log);
    // Keep last 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }

  // --- Settings ---

  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings
    };
    // Recalculate all students with updated settings
    this.recalculateAllStudents();
    this.save();
    return this.data.settings;
  }

  resetSettingsToDefault() {
    this.data.settings = {
      gradeMap: getDefaultGradeMap(),
      coThresholds: { ...DEFAULT_CO_THRESHOLDS },
      ceThresholds: { ...DEFAULT_CE_THRESHOLDS },
      internalMax: 50,
      universityMax: 100,
      totalMax: 150,
      ceMax: 30,
      assessmentTools: JSON.parse(JSON.stringify(DEFAULT_ASSESSMENT_TOOLS)),
      overallTools: JSON.parse(JSON.stringify(DEFAULT_OVERALL_TOOLS))
    };
    this.data.mapping = JSON.parse(JSON.stringify(DEFAULT_MAPPING));
    this.data.overallMapping = JSON.parse(JSON.stringify(DEFAULT_OVERALL_MAPPING));
    this.recalculateAllStudents();
    this.save();
    return this.data.settings;
  }

  recalculateAllStudents() {
    this.data.students.forEach(student => {
      const metrics = calculateAllStudentMetrics(
        student.internalMark,
        student.assessment?.grade || '',
        this.data.settings.gradeMap,
        { totalMax: this.data.settings.totalMax, ceMax: this.data.settings.ceMax }
      );
      student.assessment = {
        grade: student.assessment?.grade || '',
        universityMark: metrics.universityMark,
        co1: metrics.co1,
        co2: metrics.co2,
        co3: metrics.co3,
        co4: metrics.co4,
        co5: metrics.co5,
        continuousEvaluation: metrics.continuousEvaluation,
        updatedAt: new Date().toISOString()
      };
      student.updatedAt = new Date().toISOString();
    });
  }

  // --- Mapping ---

  getMapping() {
    const finalCOsData = calculateAllFinalCOs(this.data.settings.assessmentTools);
    const originalAttainment = calculateOriginalPOPSOAttainment(this.data.mapping);
    const { attainedMatrix, finalAttainment } = calculateAttainedMatrixAndFinal(
      finalCOsData.final,
      this.data.mapping
    );

    return {
      mapping: this.data.mapping,
      originalAttainment,
      attainedMatrix,
      finalAttainment,
      assessmentTools: finalCOsData
    };
  }

  updateMapping(newMapping) {
    this.data.mapping = newMapping;
    this.save();
    return this.getMapping();
  }

  // --- Assessment Tools ---

  getAssessmentTools() {
    return calculateAllFinalCOs(this.data.settings.assessmentTools);
  }

  updateAssessmentTools(tools) {
    this.data.settings.assessmentTools = {
      board: { ...this.data.settings.assessmentTools.board, ...(tools.board || {}) },
      survey: { ...this.data.settings.assessmentTools.survey, ...(tools.survey || {}) }
    };
    this.save();
    return this.getAssessmentTools();
  }

  // --- OVERALL CO Module ---

  getOverall() {
    const tools = this.data.settings.overallTools;
    const mapping = this.data.overallMapping;
    const originalAttainment = calculateOverallOriginalAttainment(mapping);
    const { attainedMatrix, finalAttainment } = calculateOverallFinalAttainment(tools, mapping);

    return {
      tools,
      mapping,
      originalAttainment,
      attainedMatrix,
      finalAttainment
    };
  }

  updateOverallMapping(newMapping) {
    this.data.overallMapping = newMapping;
    this.save();
    return this.getOverall();
  }

  updateOverallTools(newTools) {
    this.data.settings.overallTools = {
      board: { ...this.data.settings.overallTools.board, ...(newTools.board || {}) },
      survey: { ...this.data.settings.overallTools.survey, ...(newTools.survey || {}) },
      final: { ...this.data.settings.overallTools.final, ...(newTools.final || {}) }
    };
    this.save();
    return this.getOverall();
  }

  // --- Class Analysis / Summary ---

  getClassAnalysis() {
    const students = this.getAllStudents();
    const classSummary = calculateClassSummary(students, this.data.settings);
    const finalCOsData = this.getAssessmentTools();
    const mappingData = this.getMapping();

    // Grade distribution counts
    const gradeCounts = {};
    const grades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE', 'Pending'];
    grades.forEach(g => { gradeCounts[g] = 0; });

    let evaluated = 0;
    let pending = 0;

    students.forEach(s => {
      const g = s.assessment?.grade;
      if (g && gradeCounts[g] !== undefined) {
        gradeCounts[g]++;
        evaluated++;
      } else {
        gradeCounts['Pending']++;
        pending++;
      }
    });

    return {
      totalStudents: students.length,
      evaluatedStudents: evaluated,
      pendingStudents: pending,
      summary: classSummary,
      gradeDistribution: gradeCounts,
      assessmentTools: finalCOsData,
      mappingData: {
        originalAttainment: mappingData.originalAttainment,
        finalAttainment: mappingData.finalAttainment
      }
    };
  }
}

const db = new DatabaseService();
module.exports = db;
