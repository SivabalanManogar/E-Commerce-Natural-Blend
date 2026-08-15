function calculateDeliveryCharge(totalWeightGrams) {
  const weight = Math.max(0, Number(totalWeightGrams) || 0);
  if (weight <= 1000) {
    return 50;
  }

  const extraWeight = weight - 1000;
  const extraCharge = Math.ceil(extraWeight / 500) * 20;

  return 50 + extraCharge;
}

const testCases = [
  { weight: 200, expected: 50 },
  { weight: 400, expected: 50 },
  { weight: 500, expected: 50 },
  { weight: 800, expected: 50 },
  { weight: 1000, expected: 50 },
  { weight: 1100, expected: 70 },
  { weight: 1200, expected: 70 },
  { weight: 1500, expected: 70 },
  { weight: 1600, expected: 90 },
  { weight: 1800, expected: 90 },
  { weight: 2000, expected: 90 },
  { weight: 2100, expected: 110 },
  { weight: 2500, expected: 110 },
  { weight: 3000, expected: 130 }
];

console.log("=== RUNNING DELIVERY CALCULATION TESTS ===");
let passed = 0;
testCases.forEach(({ weight, expected }) => {
  const actual = calculateDeliveryCharge(weight);
  const isMatch = actual === expected;
  if (isMatch) passed++;
  console.log(`${isMatch ? '✅ PASS' : '❌ FAIL'}: ${weight}g -> Actual: ₹${actual} | Expected: ₹${expected}`);
});

console.log(`\nResult: ${passed}/${testCases.length} tests passed.`);
if (passed !== testCases.length) {
  process.exit(1);
}
