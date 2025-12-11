const database = require('./Database');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Set();
  }

  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log(`🔌 Overlay connected: ${socket.id}`);
      this.connectedClients.add(socket.id);

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to Payment Alert Service',
        timestamp: new Date().toISOString(),
        clientId: socket.id
      });

      // Send recent donations on connect
      this.sendRecentDonations(socket);

      socket.on('disconnect', () => {
        console.log(`🔌 Overlay disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('request_recent_donations', () => {
        this.sendRecentDonations(socket);
      });

      socket.on('request_stats', async () => {
        const stats = await this.getStats();
        socket.emit('stats_update', stats);
      });
    });
  }

  async sendRecentDonations(socket) {
    try {
      const donations = await this.getRecentDonations(5);
      socket.emit('recent_donations', {
        donations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending recent donations:', error);
    }
  }

  async getRecentDonations(limit = 5) {
    return new Promise((resolve, reject) => {
      database.db.all(
        `SELECT 
          razorpay_order_id,
          amount,
          currency,
          contact,
          email,
          description,
          payment_method,
          created_at,
          updated_at
        FROM orders 
        WHERE status = 'paid' 
        ORDER BY updated_at DESC 
        LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getStats() {
    return new Promise((resolve, reject) => {
      database.db.get(
        `SELECT 
          COUNT(*) as total_donations,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          MAX(amount) as highest_donation
        FROM orders 
        WHERE status = 'paid'`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row || { total_donations: 0, total_amount: 0, average_amount: 0, highest_donation: 0 });
        }
      );
    });
  }

  determineDonationTier(amount) {
    if (amount >= 5000) return 'ultra';
    if (amount >= 1000) return 'gold';
    if (amount >= 500) return 'silver';
    return 'basic';
  }

  async emitDonation(paymentData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    try {
      const order = await database.getOrderByRazorpayId(paymentData.order_id);
      
      if (!order) {
        console.error('Order not found for payment:', paymentData.order_id);
        return;
      }

      const tier = this.determineDonationTier(order.amount);
      
      const donationEvent = {
        id: paymentData.razorpay_payment_id,
        order_id: order.razorpay_order_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        donor_name: order.contact || 'Anonymous',
        message: order.description || '',
        payment_method: paymentData.method || order.payment_method,
        tier: tier,
        timestamp: new Date().toISOString(),
        metadata: {
          email: order.email,
          contact: order.contact
        }
      };

      console.log(`💰 Broadcasting donation: ${order.amount} ${order.currency} (${tier} tier)`);
      
      // Emit to all connected clients
      this.io.emit('new_donation', donationEvent);

      // Also emit a tier-specific event
      this.io.emit(`donation_${tier}`, donationEvent);

      // Broadcast updated stats
      const stats = await this.getStats();
      this.io.emit('stats_update', stats);

    } catch (error) {
      console.error('Error emitting donation:', error);
    }
  }

  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  async broadcastGoalProgress(goalData) {
    if (!this.io) return;

    try {
      const stats = await this.getStats();
      const progress = {
        current: stats.total_amount || 0,
        goal: goalData.goal,
        percentage: Math.min(100, ((stats.total_amount || 0) / goalData.goal) * 100),
        donations_count: stats.total_donations || 0,
        timestamp: new Date().toISOString()
      };

      this.io.emit('goal_progress', progress);
    } catch (error) {
      console.error('Error broadcasting goal progress:', error);
    }
  }
}

module.exports = new SocketService();
