/**
 * Student CO Calculator Module
 * Calculates individual student CO1-CO5 and Continuous Evaluation.
 */

const { gradeToUniversityMark } = require('./gradeCalculator');

function calculateStudentCO(internalMark, universityMark, totalMax = 150) {
  const i = Number(internalMark) || 0;
  const u = Number(universityMark) || 0;
  const max = Number(totalMax) || 150;
  return ((i + u) / max) * 100;
}

function calculateContinuousEvaluation(internalMark, ceMax = 30) {
  const i = Number(internalMark) || 0;
  const max = Number(ceMax) || 30;
  return (i / max) * 100;
}

function calculateAllStudentMetrics(internalMark, grade, customGradeMap = null, options = {}) {
  const totalMax = options.totalMax || 150;
  const ceMax = options.ceMax || 30;
  
  const universityMark = gradeToUniversityMark(grade, customGradeMap);
  const baseCO = calculateStudentCO(internalMark, universityMark, totalMax);
  const ce = calculateContinuousEvaluation(internalMark, ceMax);

  // CO1, CO2, CO3 use ((I + U) / 150) * 100
  // CO4 = CO3, CO5 = CO4
  const co1 = baseCO;
  const co2 = baseCO;
  const co3 = baseCO;
  const co4 = co3;
  const co5 = co4;

  return {
    universityMark,
    co1,
    co2,
    co3,
    co4,
    co5,
    continuousEvaluation: ce
  };
}

module.exports = {
  calculateStudentCO,
  calculateContinuousEvaluation,
  calculateAllStudentMetrics
};
