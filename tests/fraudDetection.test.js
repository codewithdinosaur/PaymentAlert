const test = require('node:test');
const assert = require('node:assert');
const { evaluateFraudIndicators, FRAUD_REASONS } = require('../utils/fraudDetection');

test('flags duplicate payment identifiers', () => {
  const result = evaluateFraudIndicators({
    hasDuplicatePaymentId: true,
    duplicateOrderPaymentCount: 0,
    amountDifference: 0,
    rapidFireCount: 1,
  });

  assert.strictEqual(result.isFlagged, true);
  assert.ok(result.reasons.includes(FRAUD_REASONS.DUPLICATE_PAYMENT_ID));
});

test('ignores minor amount differences within tolerance', () => {
  const config = { amountTolerance: 1, rapidFire: { maxPayments: 3, windowMinutes: 2 } };
  const result = evaluateFraudIndicators({
    hasDuplicatePaymentId: false,
    duplicateOrderPaymentCount: 0,
    amountDifference: 0.5,
    rapidFireCount: 1,
  }, config);

  assert.strictEqual(result.isFlagged, false);
  assert.deepStrictEqual(result.reasons, []);
});

test('identifies rapid-fire spam payments', () => {
  const config = { rapidFire: { maxPayments: 3, windowMinutes: 2 } };
  const result = evaluateFraudIndicators({
    hasDuplicatePaymentId: false,
    duplicateOrderPaymentCount: 0,
    amountDifference: 0,
    rapidFireCount: 4,
  }, config);

  assert.strictEqual(result.isFlagged, true);
  assert.ok(result.reasons.includes(FRAUD_REASONS.RAPID_FIRE_SPAM));
});
