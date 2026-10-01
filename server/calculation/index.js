const gradeCalculator = require('./gradeCalculator');
const coCalculator = require('./coCalculator');
const attainmentCalculator = require('./attainmentCalculator');
const assessmentCalculator = require('./assessmentCalculator');
const poPsoCalculator = require('./poPsoCalculator');
const overallCoCalculator = require('./overallCoCalculator');

module.exports = {
  ...gradeCalculator,
  ...coCalculator,
  ...attainmentCalculator,
  ...assessmentCalculator,
  ...poPsoCalculator,
  ...overallCoCalculator
};
