const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');
const database = require('./models/Database');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment Alert API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// Payment overlay configuration endpoint
app.get('/api/overlay-config', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      currency: 'INR',
      methods: {
        upi: {
          enabled: true,
          flow: 'intent',
          apps: ['gpay', 'phonepe', 'paytm', 'amazonpay']
        },
        card: {
          enabled: true,
          types: ['credit', 'debit']
        },
        netbanking: {
          enabled: true,
          banks: ['all_major_banks']
        },
        wallet: {
          enabled: false
        }
      },
      features: {
        save_instrument: true,
        recurring_payments: true,
        international: false
      },
      limits: {
        min_amount: 1,
        max_amount: 1000000,
        currency: 'INR'
      }
    }
  });
});

// Order status endpoint for overlay
app.get('/api/payments/status/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    
    const order = await database.getOrderByRazorpayId(order_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order_id: order.razorpay_order_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        payment_method: order.payment_method,
        contact: order.contact,
        email: order.email,
        description: order.description,
        created_at: order.created_at,
        updated_at: order.updated_at,
        qr_code: order.qr_code,
        upi_intent: order.upi_intent
      }
    });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get order status'
    });
  }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get basic statistics from database
    const db = database.db;
    
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_amount,
          COUNT(CASE WHEN payment_method = 'upi' THEN 1 END) as upi_payments,
          COUNT(CASE WHEN payment_method = 'card' THEN 1 END) as card_payments,
          COUNT(CASE WHEN payment_method = 'netbanking' THEN 1 END) as netbanking_payments
        FROM orders
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const mandateStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_mandates,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_mandates,
          COUNT(CASE WHEN status = 'authorized' THEN 1 END) as authorized_mandates,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_mandates
        FROM mandates
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(200).json({
      success: true,
      data: {
        orders: stats,
        mandates: mandateStats,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get statistics'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  database.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  database.close();
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`🚀 Payment Alert API server running on port ${config.port}`);
    console.log(`📊 Health check: http://localhost:${config.port}/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    
    if (config.nodeEnv === 'development') {
      console.log('\n📋 Available endpoints:');
      console.log(`   POST /api/payments/create-order`);
      console.log(`   POST /api/payments/create-upi-qr`);
      console.log(`   POST /api/payments/create-upi-intent`);
      console.log(`   POST /api/payments/create-upi-mandate`);
      console.log(`   GET  /api/payments/mandate/:mandate_id`);
      console.log(`   POST /api/payments/verify-payment`);
      console.log(`   POST /api/payments/cancel-mandate`);
      console.log(`   POST /api/webhooks/razorpay`);
      console.log(`   GET  /api/overlay-config`);
      console.log(`   GET  /api/payments/status/:order_id`);
      console.log(`   GET  /api/stats`);
    }
  });
}

module.exports = app;