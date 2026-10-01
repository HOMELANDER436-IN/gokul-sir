/**
 * OVERALL CO Module (ESL120.1 - ESL120.8) Calculator
 */

const { OUTCOMES } = require('./poPsoCalculator');

const OVERALL_COS = [
  'ESL120.1', 'ESL120.2', 'ESL120.3', 'ESL120.4', 
  'ESL120.5', 'ESL120.6', 'ESL120.7', 'ESL120.8'
];

const DEFAULT_OVERALL_TOOLS = {
  board: {
    'ESL120.1': 0, 'ESL120.2': 0, 'ESL120.3': 0, 'ESL120.4': 0,
    'ESL120.5': 0, 'ESL120.6': 0, 'ESL120.7': 0, 'ESL120.8': 0
  },
  survey: {
    'ESL120.1': 3, 'ESL120.2': 3, 'ESL120.3': 3, 'ESL120.4': 3,
    'ESL120.5': 3, 'ESL120.6': 3, 'ESL120.7': 3, 'ESL120.8': 3
  },
  final: {
    'ESL120.1': 2, 'ESL120.2': 3, 'ESL120.3': 3, 'ESL120.4': 3,
    'ESL120.5': 3, 'ESL120.6': 3, 'ESL120.7': 3, 'ESL120.8': 3
  }
};

const DEFAULT_OVERALL_MAPPING = {
  'ESL120.1': { targetCO: 3, PO1: 3, PO2: 0, PO3: 0, PO4: 0, PO5: 1, PO6: 1, PO7: 0, PO8: 0, PO9: 2, PO10: 2, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.2': { targetCO: 3, PO1: 1, PO2: 0, PO3: 0, PO4: 0, PO5: 1, PO6: 1, PO7: 0, PO8: 0, PO9: 2, PO10: 2, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.3': { targetCO: 3, PO1: 3, PO2: 0, PO3: 0, PO4: 0, PO5: 1, PO6: 1, PO7: 0, PO8: 2, PO9: 2, PO10: 2, PO11: 1, PO12: 1, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.4': { targetCO: 3, PO1: 1, PO2: 0, PO3: 0, PO4: 0, PO5: 1, PO6: 1, PO7: 0, PO8: 2, PO9: 2, PO10: 2, PO11: 1, PO12: 1, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.5': { targetCO: 3, PO1: 1, PO2: 0, PO3: 0, PO4: 0, PO5: 1, PO6: 1, PO7: 0, PO8: 0, PO9: 2, PO10: 2, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.6': { targetCO: 3, PO1: 2, PO2: 0, PO3: 0, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.7': { targetCO: 3, PO1: 2, PO2: 0, PO3: 0, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 },
  'ESL120.8': { targetCO: 3, PO1: 2, PO2: 0, PO3: 0, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0, PSO1: 0, PSO2: 0, PSO3: 2 }
};

function calculateOverallOriginalAttainment(mapping = DEFAULT_OVERALL_MAPPING) {
  const result = {};

  OUTCOMES.forEach(outcome => {
    let sum = 0;
    let count = 0;

    OVERALL_COS.forEach(co => {
      const val = Number(mapping[co]?.[outcome]) || 0;
      if (val > 0) {
        sum += val;
        count++;
      }
    });

    result[outcome] = count === 0 ? null : sum / count;
  });

  return result;
}

function calculateOverallFinalAttainment(tools = DEFAULT_OVERALL_TOOLS, mapping = DEFAULT_OVERALL_MAPPING) {
  const finalCOs = tools.final || DEFAULT_OVERALL_TOOLS.final;
  const attainedMatrix = {};

  OVERALL_COS.forEach(co => {
    const finalVal = Number(finalCOs[co]) || 0;
    attainedMatrix[co] = {};

    OUTCOMES.forEach(outcome => {
      const mapVal = Number(mapping[co]?.[outcome]) || 0;
      attainedMatrix[co][outcome] = mapVal === 0 ? 0 : (finalVal * mapVal) / 3;
    });
  });

  const finalAttainment = {};

  OUTCOMES.forEach(outcome => {
    let sum = 0;
    let count = 0;

    OVERALL_COS.forEach(co => {
      const val = attainedMatrix[co][outcome];
      if (val > 0) {
        sum += val;
        count++;
      }
    });

    finalAttainment[outcome] = count === 0 ? null : sum / count;
  });

  return {
    attainedMatrix,
    finalAttainment
  };
}

module.exports = {
  OVERALL_COS,
  DEFAULT_OVERALL_TOOLS,
  DEFAULT_OVERALL_MAPPING,
  calculateOverallOriginalAttainment,
  calculateOverallFinalAttainment
};
