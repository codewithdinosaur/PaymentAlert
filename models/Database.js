const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config/config');

class Database {
  constructor() {
    this.db = new sqlite3.Database(config.database.path);
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Create orders table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          razorpay_order_id TEXT UNIQUE,
          amount INTEGER NOT NULL,
          currency TEXT DEFAULT 'INR',
          status TEXT DEFAULT 'created',
          payment_method TEXT,
          contact TEXT,
          email TEXT,
          description TEXT,
          receipt TEXT,
          qr_code TEXT,
         upi_intent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create mandates table for UPI Autopay
      this.db.run(`
        CREATE TABLE IF NOT EXISTS mandates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mandate_id TEXT UNIQUE,
          razorpay_mandate_id TEXT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_contact TEXT NOT NULL,
          amount INTEGER NOT NULL,
          frequency TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          start_date DATETIME,
          end_date DATETIME,
          reference_id TEXT,
          auth_method TEXT DEFAULT 'netbanking',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create payments table for tracking payment status
      this.db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          razorpay_payment_id TEXT,
          razorpay_order_id TEXT,
          razorpay_signature TEXT,
          status TEXT DEFAULT 'pending',
          amount INTEGER NOT NULL,
          method TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id)
        )
      `);
    });
  }

  // Order operations
  createOrder(orderData) {
    return new Promise((resolve, reject) => {
      const { 
        razorpay_order_id, amount, currency, contact, email, 
        description, receipt, qr_code, upi_intent, payment_method 
      } = orderData;
      
      const stmt = this.db.prepare(`
        INSERT INTO orders (razorpay_order_id, amount, currency, contact, email, description, receipt, qr_code, upi_intent, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([razorpay_order_id, amount, currency || 'INR', contact, email, description, receipt, qr_code, upi_intent, payment_method], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...orderData });
      });
      
      stmt.finalize();
    });
  }

  getOrderByRazorpayId(razorpay_order_id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM orders WHERE razorpay_order_id = ?', [razorpay_order_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateOrderStatus(razorpay_order_id, status, payment_method = null) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('UPDATE orders SET status = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE razorpay_order_id = ?');
      stmt.run([status, payment_method, razorpay_order_id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
      stmt.finalize();
    });
  }

  // Mandate operations
  createMandate(mandateData) {
    return new Promise((resolve, reject) => {
      const { 
        mandate_id, razorpay_mandate_id, customer_name, customer_email, 
        customer_contact, amount, frequency, start_date, end_date, 
        reference_id, auth_method 
      } = mandateData;
      
      const stmt = this.db.prepare(`
        INSERT INTO mandates (mandate_id, razorpay_mandate_id, customer_name, customer_email, customer_contact, amount, frequency, start_date, end_date, reference_id, auth_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([mandate_id, razorpay_mandate_id, customer_name, customer_email, customer_contact, amount, frequency, start_date, end_date, reference_id, auth_method], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...mandateData });
      });
      
      stmt.finalize();
    });
  }

  getMandateById(mandate_id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM mandates WHERE mandate_id = ?', [mandate_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateMandateStatus(mandate_id, status) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('UPDATE mandates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE mandate_id = ?');
      stmt.run([status, mandate_id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
      stmt.finalize();
    });
  }

  // Payment operations
  createPayment(paymentData) {
    return new Promise((resolve, reject) => {
      const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, status, amount, method } = paymentData;
      
      const stmt = this.db.prepare(`
        INSERT INTO payments (order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, status, amount, method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, status, amount, method], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...paymentData });
      });
      
      stmt.finalize();
    });
  }

  getPaymentByRazorpayPaymentId(razorpay_payment_id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM payments WHERE razorpay_payment_id = ?', [razorpay_payment_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();