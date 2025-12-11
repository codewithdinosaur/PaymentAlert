const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const crypto = require('crypto');
const config = require('../config/config');
const database = require('./Database');
const socketService = require('./SocketService');

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  // Create a new order for donation
  async createOrder(orderData) {
    try {
      const { amount, currency = 'INR', contact, email, description, receipt } = orderData;
      
      // Validate required fields
      if (!amount || !contact || !email) {
        throw new Error('Amount, contact, and email are required');
      }

      // Convert amount to paise (Razorpay expects amount in smallest currency unit)
      const amountInPaise = Math.round(amount * 100);

      const orderOptions = {
        amount: amountInPaise,
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          description: description || 'Donation',
          contact: contact,
          email: email
        }
      };

      const order = await this.razorpay.orders.create(orderOptions);
      
      // Store order in database
      await database.createOrder({
        razorpay_order_id: order.id,
        amount: amount,
        currency: currency,
        contact: contact,
        email: email,
        description: description,
        receipt: receipt
      });

      return {
        success: true,
        order_id: order.id,
        amount: amount,
        currency: order.currency,
        key_id: config.razorpay.keyId,
        description: order.notes.description
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Create QR code for UPI payment
  async createUPIQRCode(orderId, amount) {
    try {
      const order = await database.getOrderByRazorpayId(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Generate UPI QR code string
      const upiString = this.generateUPIString({
        pa: config.razorpay.keyId + '@razorpay', // Virtual Payment Address
        pn: 'Payment Alert Donation', // Payee Name
        am: amount, // Amount
        tr: orderId, // Transaction Reference
        tn: order.description || 'Donation', // Transaction Note
        cu: 'INR' // Currency
      });

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Update order with QR code
      await database.updateOrder(orderId, { qr_code: qrCodeImage });

      return {
        success: true,
        qr_code: qrCodeImage,
        upi_string: upiString
      };
    } catch (error) {
      console.error('Error creating UPI QR code:', error);
      throw new Error(`Failed to create QR code: ${error.message}`);
    }
  }

  // Create UPI intent for direct UPI payments
  async createUPIIntent(orderId, amount) {
    try {
      const order = await database.getOrderByRazorpayId(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const intentOptions = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        method: 'upi',
        customer: {
          name: order.contact,
          contact: order.contact,
          email: order.email
        },
        order: {
          id: orderId,
          receipt: order.receipt
        },
        description: order.description || 'Donation'
      };

      // Note: Razorpay doesn't have a direct "create intent" method
      // This would typically be handled client-side using Razorpay's UPI flow
      const upiIntent = this.generateUPIIntentString(orderId, amount, order.contact);

      // Update order with UPI intent
      await database.updateOrder(orderId, { upi_intent: upiIntent });

      return {
        success: true,
        upi_intent: upiIntent,
        deep_link: upiIntent
      };
    } catch (error) {
      console.error('Error creating UPI intent:', error);
      throw new Error(`Failed to create UPI intent: ${error.message}`);
    }
  }

  // Create UPI Autopay mandate
  async createUPIMandate(mandateData) {
    try {
      const { 
        customer_name, customer_email, customer_contact, 
        amount, frequency, start_date, end_date, reference_id 
      } = mandateData;

      if (!customer_name || !customer_email || !customer_contact || !amount || !frequency) {
        throw new Error('Missing required mandate fields');
      }

      // Generate a unique mandate ID
      const mandate_id = `mandate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // For UPI Autopay, we create a token-based mandate
      const tokenOptions = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        frequency: frequency,
        notes: {
          customer_name: customer_name,
          customer_email: customer_email,
          reference_id: reference_id || mandate_id
        },
        auth_method: 'netbanking', // Default auth method
        expiry: {
          start: start_date,
          end: end_date
        }
      };

      // Note: Actual Razorpay UPI Autopay implementation would use their token API
      // This is a simplified version for demonstration
      
      // Create mandate record in database
      await database.createMandate({
        mandate_id: mandate_id,
        customer_name: customer_name,
        customer_email: customer_email,
        customer_contact: customer_contact,
        amount: amount,
        frequency: frequency,
        start_date: start_date,
        end_date: end_date,
        reference_id: reference_id || mandate_id,
        auth_method: 'netbanking'
      });

      // Generate authentication URL for customer verification
      const authUrl = this.generateMandateAuthUrl(mandate_id, customer_contact);

      return {
        success: true,
        mandate_id: mandate_id,
        auth_url: authUrl,
        token: `token_${mandate_id}`,
        status: 'created'
      };
    } catch (error) {
      console.error('Error creating UPI mandate:', error);
      throw new Error(`Failed to create mandate: ${error.message}`);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  // Process webhook events
  async processWebhook(body, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(body, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(body);
      console.log('Received webhook event:', event.event);

      switch (event.event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(event.payload.payment);
          break;
        case 'order.paid':
          await this.handleOrderPaid(event.payload.order);
          break;
        case 'upi.autopay.authorized':
          await this.handleUPIMandateAuthorized(event.payload.mandate);
          break;
        case 'upi.autopay.cancelled':
          await this.handleUPIMandateCancelled(event.payload.mandate);
          break;
        default:
          console.log('Unhandled webhook event:', event.event);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Helper methods
  generateUPIString({ pa, pn, am, tr, tn, cu }) {
    return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${am}&tr=${encodeURIComponent(tr)}&tn=${encodeURIComponent(tn)}&cu=${cu}`;
  }

  generateUPIIntentString(orderId, amount, contact) {
    const vpa = config.razorpay.keyId + '@razorpay';
    const tn = 'Donation';
    return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=Payment%20Alert%20Donation&am=${amount}&tr=${orderId}&tn=${encodeURIComponent(tn)}&cu=INR`;
  }

  generateMandateAuthUrl(mandateId, contact) {
    const baseUrl = 'https://api.razorpay.com/v1/upi/autopay/authorize';
    const params = new URLSearchParams({
      mandate_id: mandateId,
      customer_contact: contact
    });
    return `${baseUrl}?${params.toString()}`;
  }

  verifyWebhookSignature(body, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  async handlePaymentCaptured(payment) {
    console.log('Payment captured:', payment.id);
    await database.updateOrderStatus(payment.order_id, 'paid', payment.method);
    await database.createPayment({
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      status: 'captured',
      amount: payment.amount / 100,
      method: payment.method
    });
    
    // Emit donation to connected overlays
    await socketService.emitDonation({
      razorpay_payment_id: payment.id,
      order_id: payment.order_id,
      method: payment.method
    });
  }

  async handlePaymentFailed(payment) {
    console.log('Payment failed:', payment.id);
    await database.updateOrderStatus(payment.order_id, 'failed', payment.method);
    await database.createPayment({
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      status: 'failed',
      amount: payment.amount / 100,
      method: payment.method
    });
  }

  async handleOrderPaid(order) {
    console.log('Order paid:', order.id);
    await database.updateOrderStatus(order.id, 'paid');
    
    // Emit donation to connected overlays if payment info is available
    if (order.payment_id) {
      await socketService.emitDonation({
        razorpay_payment_id: order.payment_id,
        order_id: order.id,
        method: order.method || 'unknown'
      });
    }
  }

  async handleUPIMandateAuthorized(mandate) {
    console.log('UPI mandate authorized:', mandate.id);
    await database.updateMandateStatus(mandate.id, 'authorized');
  }

  async handleUPIMandateCancelled(mandate) {
    console.log('UPI mandate cancelled:', mandate.id);
    await database.updateMandateStatus(mandate.id, 'cancelled');
  }

  // Update order in database
  async updateOrder(orderId, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      const stmt = database.db.prepare(`UPDATE orders SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE razorpay_order_id = ?`);
      stmt.run([...values, orderId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
      stmt.finalize();
    });
  }
}

module.exports = new RazorpayService();