// Example usage of the Payment Alert API
// This file demonstrates how to interact with all the API endpoints

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Example: Create a new donation order
async function createOrderExample() {
  try {
    const response = await axios.post(`${API_BASE}/payments/create-order`, {
      amount: 100.50,
      currency: 'INR',
      contact: '+919876543210',
      email: 'donor@example.com',
      description: 'Monthly donation to help children',
      receipt: 'donation_123'
    });

    console.log('Order created successfully:', response.data);
    return response.data.data.order_id;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
  }
}

// Example: Generate QR code for UPI payment
async function createUPIQRExample(orderId) {
  try {
    const response = await axios.post(`${API_BASE}/payments/create-upi-qr`, {
      order_id: orderId,
      amount: 100.50
    });

    console.log('QR code generated successfully:', response.data);
    return response.data.data.qr_code;
  } catch (error) {
    console.error('Error creating QR code:', error.response?.data || error.message);
  }
}

// Example: Create UPI intent for direct payment
async function createUPIIntentExample(orderId) {
  try {
    const response = await axios.post(`${API_BASE}/payments/create-upi-intent`, {
      order_id: orderId,
      amount: 100.50
    });

    console.log('UPI intent created successfully:', response.data);
    return response.data.data.upi_intent;
  } catch (error) {
    console.error('Error creating UPI intent:', error.response?.data || error.message);
  }
}

// Example: Create UPI Autopay mandate
async function createUPIMandateExample() {
  try {
    const response = await axios.post(`${API_BASE}/payments/create-upi-mandate`, {
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      customer_contact: '+919876543210',
      amount: 500.00,
      frequency: 'monthly',
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-12-31T23:59:59Z',
      reference_id: 'monthly_donation_mandate'
    });

    console.log('UPI mandate created successfully:', response.data);
    return response.data.data.mandate_id;
  } catch (error) {
    console.error('Error creating UPI mandate:', error.response?.data || error.message);
  }
}

// Example: Get mandate status
async function getMandateExample(mandateId) {
  try {
    const response = await axios.get(`${API_BASE}/payments/mandate/${mandateId}`);
    console.log('Mandate details:', response.data);
  } catch (error) {
    console.error('Error getting mandate:', error.response?.data || error.message);
  }
}

// Example: Cancel mandate
async function cancelMandateExample(mandateId) {
  try {
    const response = await axios.post(`${API_BASE}/payments/cancel-mandate`, {
      mandate_id: mandateId
    });

    console.log('Mandate cancelled successfully:', response.data);
  } catch (error) {
    console.error('Error cancelling mandate:', error.response?.data || error.message);
  }
}

// Example: Verify payment
async function verifyPaymentExample(orderId, paymentId, signature) {
  try {
    const response = await axios.post(`${API_BASE}/payments/verify-payment`, {
      order_id: orderId,
      payment_id: paymentId,
      signature: signature
    });

    console.log('Payment verified successfully:', response.data);
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
  }
}

// Example: Get overlay configuration
async function getOverlayConfigExample() {
  try {
    const response = await axios.get(`${API_BASE}/overlay-config`);
    console.log('Overlay configuration:', response.data);
  } catch (error) {
    console.error('Error getting overlay config:', error.response?.data || error.message);
  }
}

// Example: Get order status
async function getOrderStatusExample(orderId) {
  try {
    const response = await axios.get(`${API_BASE}/payments/status/${orderId}`);
    console.log('Order status:', response.data);
  } catch (error) {
    console.error('Error getting order status:', error.response?.data || error.message);
  }
}

// Example: Get statistics
async function getStatsExample() {
  try {
    const response = await axios.get(`${API_BASE}/stats`);
    console.log('Statistics:', response.data);
  } catch (error) {
    console.error('Error getting stats:', error.response?.data || error.message);
  }
}

// Example: Health check
async function healthCheckExample() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('Health check:', response.data);
  } catch (error) {
    console.error('Error in health check:', error.response?.data || error.message);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Running Payment Alert API Examples\n');

  // Health check
  console.log('1. Health Check');
  await healthCheckExample();
  console.log('');

  // Create order
  console.log('2. Create Order');
  const orderId = await createOrderExample();
  console.log('');

  if (orderId) {
    // Generate QR code
    console.log('3. Generate QR Code');
    const qrCode = await createUPIQRExample(orderId);
    console.log('');

    // Create UPI intent
    console.log('4. Create UPI Intent');
    const upiIntent = await createUPIIntentExample(orderId);
    console.log('');

    // Get order status
    console.log('5. Get Order Status');
    await getOrderStatusExample(orderId);
    console.log('');
  }

  // Create UPI mandate
  console.log('6. Create UPI Mandate');
  const mandateId = await createUPIMandateExample();
  console.log('');

  if (mandateId) {
    // Get mandate status
    console.log('7. Get Mandate Status');
    await getMandateExample(mandateId);
    console.log('');

    // Cancel mandate
    console.log('8. Cancel Mandate');
    await cancelMandateExample(mandateId);
    console.log('');
  }

  // Get overlay configuration
  console.log('9. Get Overlay Configuration');
  await getOverlayConfigExample();
  console.log('');

  // Get statistics
  console.log('10. Get Statistics');
  await getStatsExample();
  console.log('');

  console.log('✅ All examples completed!');
}

// Uncomment the line below to run all examples
// runAllExamples();

module.exports = {
  createOrderExample,
  createUPIQRExample,
  createUPIIntentExample,
  createUPIMandateExample,
  getMandateExample,
  cancelMandateExample,
  verifyPaymentExample,
  getOverlayConfigExample,
  getOrderStatusExample,
  getStatsExample,
  healthCheckExample,
  runAllExamples
};