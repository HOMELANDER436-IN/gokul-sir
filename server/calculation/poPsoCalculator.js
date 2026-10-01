/**
 * PO / PSO Attainment Calculator Module
 * Handles mapping matrix, original PO/PSO attainment, attained matrix, and final PO/PSO attainment.
 */

const OUTCOMES = [
  'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 
  'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 
  'PSO1', 'PSO2', 'PSO3'
];

const DEFAULT_MAPPING = {
  CO1: { PO1: 0, PO2: 0, PO3: 0, PO4: 3, PO5: 2, PO6: 1, PO7: 0, PO8: 0, PO9: 1, PO10: 2, PO11: 0, PO12: 2, PSO1: 3, PSO2: 3, PSO3: 3 },
  CO2: { PO1: 0, PO2: 0, PO3: 0, PO4: 3, PO5: 2, PO6: 1, PO7: 0, PO8: 0, PO9: 1, PO10: 2, PO11: 0, PO12: 2, PSO1: 3, PSO2: 3, PSO3: 3 },
  CO3: { PO1: 0, PO2: 0, PO3: 0, PO4: 3, PO5: 2, PO6: 1, PO7: 0, PO8: 2, PO9: 1, PO10: 2, PO11: 0, PO12: 2, PSO1: 3, PSO2: 3, PSO3: 3 },
  CO4: { PO1: 0, PO2: 0, PO3: 0, PO4: 2, PO5: 1, PO6: 1, PO7: 0, PO8: 2, PO9: 1, PO10: 2, PO11: 0, PO12: 2, PSO1: 3, PSO2: 2, PSO3: 3 },
  CO5: { PO1: 0, PO2: 0, PO3: 0, PO4: 3, PO5: 2, PO6: 1, PO7: 0, PO8: 0, PO9: 1, PO10: 2, PO11: 0, PO12: 2, PSO1: 3, PSO2: 3, PSO3: 3 }
};

function calculateOriginalPOPSOAttainment(mapping = DEFAULT_MAPPING) {
  const result = {};

  OUTCOMES.forEach(outcome => {
    let sum = 0;
    let count = 0;

    Object.keys(mapping).forEach(coKey => {
      const val = Number(mapping[coKey]?.[outcome]) || 0;
      if (val > 0) {
        sum += val;
        count++;
      }
    });

    if (count === 0) {
      result[outcome] = null; // Display as N/A
    } else {
      result[outcome] = sum / count;
    }
  });

  return result;
}

function calculateMappedAttainedValue(finalCO, mappingValue, maxLevel = 3) {
  const f = Number(finalCO) || 0;
  const m = Number(mappingValue) || 0;
  if (m === 0) return 0;
  return (f * m) / (Number(maxLevel) || 3);
}

function calculateAttainedMatrixAndFinal(finalCOs, mapping = DEFAULT_MAPPING, maxLevel = 3) {
  const attainedMatrix = {};
  const coKeys = Object.keys(mapping);

  coKeys.forEach(coKey => {
    const coLower = coKey.toLowerCase();
    const finalVal = finalCOs[coLower] ?? finalCOs[coKey] ?? 0;
    attainedMatrix[coKey] = {};

    OUTCOMES.forEach(outcome => {
      const mapVal = Number(mapping[coKey]?.[outcome]) || 0;
      attainedMatrix[coKey][outcome] = calculateMappedAttainedValue(finalVal, mapVal, maxLevel);
    });
  });

  const finalAttainment = {};

  OUTCOMES.forEach(outcome => {
    let sum = 0;
    let count = 0;

    coKeys.forEach(coKey => {
      const val = attainedMatrix[coKey][outcome];
      if (val > 0) {
        sum += val;
        count++;
      }
    });

    if (count === 0) {
      finalAttainment[outcome] = null; // Display as N/A
    } else {
      finalAttainment[outcome] = sum / count;
    }
  });

  return {
    attainedMatrix,
    finalAttainment
  };
}

module.exports = {
  OUTCOMES,
  DEFAULT_MAPPING,
  calculateOriginalPOPSOAttainment,
  calculateMappedAttainedValue,
  calculateAttainedMatrixAndFinal
};
