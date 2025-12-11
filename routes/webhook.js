const express = require('express');
const router = express.Router();
const RazorpayService = require('../models/RazorpayService');
const crypto = require('crypto');

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Handle Razorpay webhooks
 * @access  Public
 */
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    console.log('Received webhook:', {
      event: req.body?.event,
      signature: signature ? 'present' : 'missing'
    });

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing webhook signature'
      });
    }

    // Process the webhook
    const result = await RazorpayService.processWebhook(rawBody, signature);
    console.log('Webhook handled successfully:', {
      event: result?.event,
      flagged: result?.result?.flagged,
    });
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process webhook'
    });
  }
});

/**
 * @route   GET /api/webhooks/health
 * @desc    Webhook health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook endpoint is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;