const FRAUD_REASONS = {
  DUPLICATE_PAYMENT_ID: 'duplicate_payment_id',
  DUPLICATE_ORDER_PAYMENT: 'duplicate_order_payment',
  AMOUNT_MISMATCH: 'amount_mismatch',
  RAPID_FIRE_SPAM: 'rapid_fire_spam',
};

const DEFAULT_FRAUD_CONFIG = {
  amountTolerance: 0,
  rapidFire: {
    maxPayments: 3,
    windowMinutes: 2,
  },
};

function resolveFraudConfig(config = {}) {
  const base = {
    amountTolerance: Number.isFinite(config.amountTolerance)
      ? Number(config.amountTolerance)
      : DEFAULT_FRAUD_CONFIG.amountTolerance,
    rapidFire: {
      maxPayments: Number.isFinite(config?.rapidFire?.maxPayments)
        ? Number(config.rapidFire.maxPayments)
        : DEFAULT_FRAUD_CONFIG.rapidFire.maxPayments,
      windowMinutes: Number.isFinite(config?.rapidFire?.windowMinutes)
        ? Number(config.rapidFire.windowMinutes)
        : DEFAULT_FRAUD_CONFIG.rapidFire.windowMinutes,
    },
  };

  return base;
}

function evaluateFraudIndicators(indicators = {}, config = {}) {
  const resolvedConfig = resolveFraudConfig(config);
  const reasons = [];
  const metadata = {
    duplicatePaymentId: Boolean(indicators.hasDuplicatePaymentId),
    duplicateOrderPaymentCount: indicators.duplicateOrderPaymentCount || 0,
    amountDifference: Number(indicators.amountDifference || 0),
    rapidFireCount: Number(indicators.rapidFireCount || 0),
  };

  if (indicators.hasDuplicatePaymentId) {
    reasons.push(FRAUD_REASONS.DUPLICATE_PAYMENT_ID);
  }

  if ((indicators.duplicateOrderPaymentCount || 0) > 0) {
    reasons.push(FRAUD_REASONS.DUPLICATE_ORDER_PAYMENT);
  }

  if (Math.abs(indicators.amountDifference || 0) > resolvedConfig.amountTolerance) {
    reasons.push(FRAUD_REASONS.AMOUNT_MISMATCH);
  }

  if ((indicators.rapidFireCount || 0) >= resolvedConfig.rapidFire.maxPayments) {
    reasons.push(FRAUD_REASONS.RAPID_FIRE_SPAM);
  }

  return {
    isFlagged: reasons.length > 0,
    reasons,
    metadata,
  };
}

module.exports = {
  FRAUD_REASONS,
  evaluateFraudIndicators,
};
