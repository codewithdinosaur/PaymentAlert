const express = require('express');
const router = express.Router();
const RazorpayService = require('../models/RazorpayService');
const { validate, orderCreationSchema } = require('../middleware/validation');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new Razorpay order for donation
 * @access  Public
 */
router.post('/create-order', validate(orderCreationSchema), async (req, res) => {
  try {
    const orderData = req.validatedData;
    
    const orderResponse = await RazorpayService.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: orderResponse.order_id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        key_id: orderResponse.key_id,
        description: orderResponse.description,
        contact: orderData.contact,
        email: orderData.email
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
});

/**
 * @route   POST /api/payments/create-upi-qr
 * @desc    Generate QR code for UPI payment
 * @access  Public
 */
router.post('/create-upi-qr', async (req, res) => {
  try {
    const { order_id, amount } = req.body;
    
    if (!order_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and amount are required'
      });
    }

    const qrResponse = await RazorpayService.createUPIQRCode(order_id, amount);
    
    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qr_code: qrResponse.qr_code,
        upi_string: qrResponse.upi_string,
        order_id: order_id,
        amount: amount
      }
    });
  } catch (error) {
    console.error('Create UPI QR error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate QR code'
    });
  }
});

/**
 * @route   POST /api/payments/create-upi-intent
 * @desc    Create UPI intent for direct UPI payments
 * @access  Public
 */
router.post('/create-upi-intent', async (req, res) => {
  try {
    const { order_id, amount } = req.body;
    
    if (!order_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and amount are required'
      });
    }

    const intentResponse = await RazorpayService.createUPIIntent(order_id, amount);
    
    res.status(200).json({
      success: true,
      message: 'UPI intent created successfully',
      data: {
        upi_intent: intentResponse.upi_intent,
        deep_link: intentResponse.deep_link,
        order_id: order_id,
        amount: amount
      }
    });
  } catch (error) {
    console.error('Create UPI intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create UPI intent'
    });
  }
});

/**
 * @route   POST /api/payments/create-upi-mandate
 * @desc    Create UPI Autopay mandate
 * @access  Public
 */
router.post('/create-upi-mandate', async (req, res) => {
  try {
    const { upiMandateSchema } = require('../middleware/validation');
    const { error, value } = upiMandateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    const mandateResponse = await RazorpayService.createUPIMandate(value);
    
    res.status(201).json({
      success: true,
      message: 'UPI mandate created successfully',
      data: {
        mandate_id: mandateResponse.mandate_id,
        auth_url: mandateResponse.auth_url,
        token: mandateResponse.token,
        status: mandateResponse.status
      }
    });
  } catch (error) {
    console.error('Create UPI mandate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create UPI mandate'
    });
  }
});

/**
 * @route   GET /api/payments/mandate/:mandate_id
 * @desc    Get mandate status and details
 * @access  Public
 */
router.get('/mandate/:mandate_id', async (req, res) => {
  try {
    const { mandate_id } = req.params;
    
    const database = require('../models/Database');
    const mandate = await database.getMandateById(mandate_id);
    
    if (!mandate) {
      return res.status(404).json({
        success: false,
        error: 'Mandate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        mandate_id: mandate.mandate_id,
        customer_name: mandate.customer_name,
        customer_email: mandate.customer_email,
        customer_contact: mandate.customer_contact,
        amount: mandate.amount,
        frequency: mandate.frequency,
        status: mandate.status,
        start_date: mandate.start_date,
        end_date: mandate.end_date,
        reference_id: mandate.reference_id,
        auth_method: mandate.auth_method,
        created_at: mandate.created_at
      }
    });
  } catch (error) {
    console.error('Get mandate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get mandate details'
    });
  }
});

/**
 * @route   POST /api/payments/verify-payment
 * @desc    Verify payment signature and update status
 * @access  Public
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Order ID, payment ID, and signature are required'
      });
    }

    // Verify payment signature
    const isValid = RazorpayService.verifyPaymentSignature({
      razorpay_order_id: order_id,
      razorpay_payment_id: payment_id,
      razorpay_signature: signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Update payment status in database
    const database = require('../models/Database');
    await database.updateOrderStatus(order_id, 'verified');
    await database.createPayment({
      razorpay_payment_id: payment_id,
      razorpay_order_id: order_id,
      status: 'verified',
      amount: 0, // Will be updated from Razorpay if needed
      method: 'upi'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_id: order_id,
        payment_id: payment_id,
        verified: true
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment'
    });
  }
});

/**
 * @route   POST /api/payments/cancel-mandate
 * @desc    Cancel UPI Autopay mandate
 * @access  Public
 */
router.post('/cancel-mandate', async (req, res) => {
  try {
    const { mandate_id } = req.body;
    
    if (!mandate_id) {
      return res.status(400).json({
        success: false,
        error: 'Mandate ID is required'
      });
    }

    const database = require('../models/Database');
    const mandate = await database.getMandateById(mandate_id);
    
    if (!mandate) {
      return res.status(404).json({
        success: false,
        error: 'Mandate not found'
      });
    }

    // Update mandate status to cancelled
    await database.updateMandateStatus(mandate_id, 'cancelled');

    // Note: In a real implementation, you would also call Razorpay API to cancel the mandate

    res.status(200).json({
      success: true,
      message: 'Mandate cancelled successfully',
      data: {
        mandate_id: mandate_id,
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error('Cancel mandate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel mandate'
    });
  }
});

module.exports = router;