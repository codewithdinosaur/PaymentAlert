const express = require('express');
const router = express.Router();
const database = require('../models/Database');

const parseJson = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse JSON column from fraud log:', error.message);
    return fallback;
  }
};

const serializeFraudLog = (log) => {
  if (!log) return null;

  return {
    ...log,
    reasons: parseJson(log.reasons, []),
    metadata: parseJson(log.metadata, {}),
  };
};

router.get('/logs', async (req, res) => {
  try {
    const { status } = req.query;
    const logs = await database.listFraudLogs(status);

    res.status(200).json({
      success: true,
      data: logs.map(serializeFraudLog),
    });
  } catch (error) {
    console.error('Failed to fetch fraud logs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to fetch fraud logs',
    });
  }
});

async function reviewFraudLog(req, res, targetStatus) {
  try {
    const { id } = req.params;
    const { reviewer = 'admin', notes } = req.body || {};

    const log = await database.getFraudLogById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Fraud log not found',
      });
    }

    await database.updateFraudLogStatus(log.id, targetStatus, reviewer, notes);

    if (log.razorpay_order_id) {
      const orderStatus = targetStatus === 'approved' ? 'paid' : 'rejected';
      await database.updateOrderStatus(log.razorpay_order_id, orderStatus, null);
    }

    if (log.razorpay_payment_id) {
      const paymentStatus = targetStatus === 'approved' ? 'approved' : 'rejected';
      await database.updatePaymentStatusByPaymentId(log.razorpay_payment_id, paymentStatus);
    }

    const updatedLog = await database.getFraudLogById(log.id);

    res.status(200).json({
      success: true,
      data: serializeFraudLog(updatedLog),
    });
  } catch (error) {
    console.error(`Failed to ${targetStatus} fraud log:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to process fraud review',
    });
  }
}

router.post('/logs/:id/approve', (req, res) => reviewFraudLog(req, res, 'approved'));
router.post('/logs/:id/reject', (req, res) => reviewFraudLog(req, res, 'rejected'));

module.exports = router;
