/**
 * Grade Calculator Module
 * Handles grade conversions to University Marks according to official rubric.
 */

const DEFAULT_GRADE_MAP = {
  'S': 100,
  'A+': 89,
  'A': 84,
  'B+': 79,
  'B': 74,
  'C+': 69,
  'C': 64,
  'D': 59,
  'P': 54,
  'F': 0,
  'FE': 0
};

const ALLOWED_GRADES = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE'];

function getGradeList() {
  return [...ALLOWED_GRADES];
}

function getDefaultGradeMap() {
  return { ...DEFAULT_GRADE_MAP };
}

function gradeToUniversityMark(grade, customMap = null) {
  if (!grade) return 0;
  const normalized = String(grade).trim().toUpperCase();
  const map = customMap || DEFAULT_GRADE_MAP;
  if (Object.prototype.hasOwnProperty.call(map, normalized)) {
    return Number(map[normalized]);
  }
  return 0;
}

function isValidGrade(grade, customMap = null) {
  if (!grade) return false;
  const normalized = String(grade).trim().toUpperCase();
  const map = customMap || DEFAULT_GRADE_MAP;
  return Object.prototype.hasOwnProperty.call(map, normalized);
}

module.exports = {
  DEFAULT_GRADE_MAP,
  ALLOWED_GRADES,
  getGradeList,
  getDefaultGradeMap,
  gradeToUniversityMark,
  isValidGrade
};
