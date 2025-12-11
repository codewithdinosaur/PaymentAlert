require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  database: {
    path: process.env.DB_PATH || './payment.db',
  },
  fraud: {
    amountTolerance: parseFloat(process.env.FRAUD_AMOUNT_TOLERANCE || '0'),
    rapidFire: {
      windowMinutes: parseInt(process.env.FRAUD_RAPID_FIRE_WINDOW_MINUTES || '2', 10),
      maxPayments: parseInt(process.env.FRAUD_RAPID_FIRE_MAX_PAYMENTS || '3', 10),
    },
  },
};

module.exports = config;