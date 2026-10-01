const assert = require('assert');
const {
  gradeToUniversityMark,
  calculateStudentCO,
  calculateContinuousEvaluation,
  calculateCOAttainmentPercentage,
  calculateCOAttainmentLevel,
  calculateCEAttainmentLevel,
  calculateMappedAttainedValue,
  calculateOriginalPOPSOAttainment,
  calculateAllStudentMetrics
} = require('../server/calculation');

console.log('--- Running CO Attainment Calculation Tests ---');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}: ${err.message}`);
  }
}

// Test 1: Internal = 38, Grade = B
runTest('Test 1: Internal=38, Grade=B => Univ=74, CO=74.6667, CE=126.6667', () => {
  const univ = gradeToUniversityMark('B');
  assert.strictEqual(univ, 74, 'University mark should be 74');
  
  const co = calculateStudentCO(38, univ);
  assert(Math.abs(co - 74.6666666667) < 0.0001, `CO was ${co}`);
  
  const ce = calculateContinuousEvaluation(38);
  assert(Math.abs(ce - 126.6666666667) < 0.0001, `CE was ${ce}`);
});

// Test 2: Internal = 32, Grade = C+
runTest('Test 2: Internal=32, Grade=C+ => Univ=69, CO=67.3333', () => {
  const univ = gradeToUniversityMark('C+');
  assert.strictEqual(univ, 69, 'University mark should be 69');
  
  const co = calculateStudentCO(32, univ);
  assert(Math.abs(co - 67.3333333333) < 0.0001, `CO was ${co}`);
});

// Test 3: Internal = 28, Grade = F
runTest('Test 3: Internal=28, Grade=F => Univ=0, CO=18.6667', () => {
  const univ = gradeToUniversityMark('F');
  assert.strictEqual(univ, 0, 'University mark should be 0');
  
  const co = calculateStudentCO(28, univ);
  assert(Math.abs(co - 18.6666666667) < 0.0001, `CO was ${co}`);
});

// Test 4: 52 attained, 58 total => 90%, Level 3
runTest('Test 4: 52 attained, 58 total => 90%, Level 3', () => {
  const pct = calculateCOAttainmentPercentage(52, 58);
  assert.strictEqual(pct, 90, `Percentage was ${pct}`);
  
  const level = calculateCOAttainmentLevel(pct);
  assert.strictEqual(level, 3, `Level was ${level}`);
});

// Test 5: 5 continuous-evaluation students, denominator = 14 => 36%, No attainment
runTest('Test 5: 5 CE students, denominator=14 => 36%, Level 0 (No attainment)', () => {
  const pct = calculateCOAttainmentPercentage(5, 14);
  assert.strictEqual(pct, 36, `Percentage was ${pct}`);
  
  const level = calculateCEAttainmentLevel(pct);
  assert.strictEqual(level, 0, `Level was ${level}, expected 0 (No attainment)`);
});

// Test 6: Final CO = 2.75, Mapping = 3 => 2.75
runTest('Test 6: Final CO=2.75, Mapping=3 => 2.75', () => {
  const val = calculateMappedAttainedValue(2.75, 3);
  assert.strictEqual(val, 2.75, `Value was ${val}`);
});

// Test 7: Final CO = 2.75, Mapping = 2 => 1.833333...
runTest('Test 7: Final CO=2.75, Mapping=2 => 1.833333...', () => {
  const val = calculateMappedAttainedValue(2.75, 2);
  assert(Math.abs(val - 1.8333333333) < 0.0001, `Value was ${val}`);
});

// Test 8: Mapping = 0 => 0
runTest('Test 8: Mapping=0 => 0', () => {
  const val = calculateMappedAttainedValue(2.75, 0);
  assert.strictEqual(val, 0, `Value was ${val}`);
});

// Test 9: No positive mappings => N/A (null), never #DIV/0!
runTest('Test 9: No positive mappings => null (N/A), never #DIV/0!', () => {
  const dummyMapping = {
    CO1: { PO1: 0, PO2: 0 },
    CO2: { PO1: 0, PO2: 0 }
  };
  const attainment = calculateOriginalPOPSOAttainment(dummyMapping);
  assert.strictEqual(attainment.PO1, null, 'Unmapped PO1 should be null (N/A)');
  assert.strictEqual(attainment.PO2, null, 'Unmapped PO2 should be null (N/A)');
  assert(!String(attainment.PO1).includes('DIV'), 'Must never output #DIV/0!');
});

// Test 10: Full Student Metrics calculation
runTest('Test 10: Full calculateAllStudentMetrics on roll 4 (Akash)', () => {
  const metrics = calculateAllStudentMetrics(38, 'B');
  assert.strictEqual(metrics.universityMark, 74);
  assert(Math.abs(metrics.co1 - 74.6666667) < 0.0001);
  assert.strictEqual(metrics.co4, metrics.co3);
  assert.strictEqual(metrics.co5, metrics.co4);
  assert(Math.abs(metrics.continuousEvaluation - 126.6666667) < 0.0001);
});

console.log(`\n========================================`);
console.log(`Results: ${passed} of ${total} tests passed.`);
console.log(`========================================`);

if (passed !== total) {
  process.exit(1);
}
