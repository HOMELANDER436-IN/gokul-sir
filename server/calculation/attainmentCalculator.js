/**
 * Class CO Attainment Calculator Module
 * Calculates attainment counts, percentages, and levels for class.
 */

const DEFAULT_CO_THRESHOLDS = {
  lower: 55,
  upper: 100,
  level3: 75,
  level2: 65,
  level1: 55
};

const DEFAULT_CE_THRESHOLDS = {
  lower: 55,
  upper: 100,
  level3: 70,
  level2: 60,
  level1: 50,
  denominator: 14
};

function calculateCOAttainmentCount(values, lower = 55, upper = 100) {
  if (!Array.isArray(values)) return 0;
  return values.filter(val => {
    const num = Number(val);
    return !isNaN(num) && num >= lower && num <= upper;
  }).length;
}

function calculateCOAttainmentPercentage(attainedCount, totalStudents) {
  const count = Number(attainedCount) || 0;
  const total = Number(totalStudents) || 0;
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

function calculateCOAttainmentLevel(percentage, thresholds = DEFAULT_CO_THRESHOLDS) {
  const p = Number(percentage) || 0;
  const t3 = thresholds?.level3 ?? 75;
  const t2 = thresholds?.level2 ?? 65;
  const t1 = thresholds?.level1 ?? 55;

  // Strict greater than per workbook: >75 => 3, >65 => 2, >55 => 1
  if (p > t3) return 3;
  if (p > t2) return 2;
  if (p > t1) return 1;
  return 0; // No attainment
}

function calculateCEAttainmentLevel(percentage, thresholds = DEFAULT_CE_THRESHOLDS) {
  const p = Number(percentage) || 0;
  const t3 = thresholds?.level3 ?? 70;
  const t2 = thresholds?.level2 ?? 60;
  const t1 = thresholds?.level1 ?? 50;

  // Strict greater than per workbook: >70 => 3, >60 => 2, >50 => 1
  if (p > t3) return 3;
  if (p > t2) return 2;
  if (p > t1) return 1;
  return 0; // No attainment
}

function calculateClassSummary(students, settings = {}) {
  const totalStudents = students.length;
  const coThresholds = settings.coThresholds || DEFAULT_CO_THRESHOLDS;
  const ceThresholds = settings.ceThresholds || DEFAULT_CE_THRESHOLDS;
  const ceDenominator = Number(ceThresholds.denominator) || 14;

  const coKeys = ['co1', 'co2', 'co3', 'co4', 'co5'];
  const summary = {};

  coKeys.forEach(co => {
    const values = students.map(s => s[co] ?? s.assessment?.[co] ?? 0);
    const count = calculateCOAttainmentCount(values, coThresholds.lower, coThresholds.upper);
    const percentage = calculateCOAttainmentPercentage(count, totalStudents);
    const level = calculateCOAttainmentLevel(percentage, coThresholds);

    summary[co] = {
      attainedCount: count,
      totalStudents,
      percentage,
      level,
      average: values.length ? Number((values.reduce((a, b) => a + Number(b), 0) / values.length).toFixed(2)) : 0
    };
  });

  // Continuous Evaluation
  const ceValues = students.map(s => s.continuousEvaluation ?? s.ce ?? s.assessment?.continuousEvaluation ?? 0);
  const ceCount = calculateCOAttainmentCount(ceValues, ceThresholds.lower, ceThresholds.upper);
  const cePercentage = calculateCOAttainmentPercentage(ceCount, ceDenominator);
  const ceLevel = calculateCEAttainmentLevel(cePercentage, ceThresholds);

  summary.continuousEvaluation = {
    attainedCount: ceCount,
    totalStudents,
    denominator: ceDenominator,
    percentage: cePercentage,
    level: ceLevel,
    average: ceValues.length ? Number((ceValues.reduce((a, b) => a + Number(b), 0) / ceValues.length).toFixed(2)) : 0
  };

  return summary;
}

module.exports = {
  DEFAULT_CO_THRESHOLDS,
  DEFAULT_CE_THRESHOLDS,
  calculateCOAttainmentCount,
  calculateCOAttainmentPercentage,
  calculateCOAttainmentLevel,
  calculateCEAttainmentLevel,
  calculateClassSummary
};
