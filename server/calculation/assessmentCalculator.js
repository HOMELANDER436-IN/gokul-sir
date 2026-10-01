/**
 * Assessment Tools Calculator Module
 * Calculates Final CO from Board/University Exam and Survey tools.
 */

const DEFAULT_ASSESSMENT_TOOLS = {
  board: { co1: 3, co2: 3, co3: 3, co4: 3, co5: 3 },
  survey: { co1: 2.50, co2: 2.70, co3: 3.00, co4: 2.84, co5: 2.80 }
};

function calculateFinalCO(boardValue, surveyValue) {
  const b = Number(boardValue) || 0;
  const s = Number(surveyValue) || 0;
  return (b + s) / 2;
}

function calculateAllFinalCOs(tools = DEFAULT_ASSESSMENT_TOOLS) {
  const board = tools?.board || DEFAULT_ASSESSMENT_TOOLS.board;
  const survey = tools?.survey || DEFAULT_ASSESSMENT_TOOLS.survey;
  const finalCOs = {};

  ['co1', 'co2', 'co3', 'co4', 'co5'].forEach(co => {
    finalCOs[co] = calculateFinalCO(board[co], survey[co]);
  });

  return {
    board,
    survey,
    final: finalCOs
  };
}

module.exports = {
  DEFAULT_ASSESSMENT_TOOLS,
  calculateFinalCO,
  calculateAllFinalCOs
};
