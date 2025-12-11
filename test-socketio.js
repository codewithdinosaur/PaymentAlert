#!/usr/bin/env node

/**
 * Socket.IO Test Client
 * Tests real-time donation broadcasting functionality
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

console.log('🧪 Socket.IO Test Client');
console.log('📡 Connecting to:', SOCKET_URL);
console.log('');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('🆔 Client ID:', socket.id);
  console.log('');
});

socket.on('connected', (data) => {
  console.log('📨 Received connection confirmation:', data);
  console.log('');
});

socket.on('new_donation', (donation) => {
  console.log('💰 NEW DONATION RECEIVED!');
  console.log('   Amount:', `₹${donation.amount}`);
  console.log('   Tier:', donation.tier.toUpperCase());
  console.log('   Donor:', donation.donor_name);
  console.log('   Message:', donation.message || '(no message)');
  console.log('   Method:', donation.payment_method);
  console.log('   Timestamp:', donation.timestamp);
  console.log('');
});

socket.on('donation_basic', (donation) => {
  console.log('🟢 BASIC tier donation:', `₹${donation.amount}`);
});

socket.on('donation_silver', (donation) => {
  console.log('⚪ SILVER tier donation:', `₹${donation.amount}`);
});

socket.on('donation_gold', (donation) => {
  console.log('🟡 GOLD tier donation:', `₹${donation.amount}`);
});

socket.on('donation_ultra', (donation) => {
  console.log('🌈 ULTRA tier donation:', `₹${donation.amount}`);
});

socket.on('recent_donations', (data) => {
  console.log('📋 Recent Donations List:');
  if (data.donations.length === 0) {
    console.log('   (no donations yet)');
  } else {
    data.donations.forEach((d, i) => {
      console.log(`   ${i + 1}. ₹${d.amount} from ${d.contact || 'Anonymous'}`);
    });
  }
  console.log('');
});

socket.on('stats_update', (stats) => {
  console.log('📊 Statistics Update:');
  console.log('   Total Donations:', stats.total_donations || 0);
  console.log('   Total Amount:', `₹${stats.total_amount || 0}`);
  console.log('   Average:', `₹${(stats.average_amount || 0).toFixed(2)}`);
  console.log('   Highest:', `₹${stats.highest_donation || 0}`);
  console.log('');
});

socket.on('goal_progress', (progress) => {
  console.log('🎯 Goal Progress Update:');
  console.log('   Current:', `₹${progress.current}`);
  console.log('   Goal:', `₹${progress.goal}`);
  console.log('   Progress:', `${progress.percentage.toFixed(1)}%`);
  console.log('   Donations:', progress.donations_count);
  console.log('');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('🔴 Connection error:', error.message);
  process.exit(1);
});

// Keep the script running
console.log('👂 Listening for events... (Press Ctrl+C to exit)');
console.log('');

// Request recent donations after connecting
setTimeout(() => {
  if (socket.connected) {
    console.log('📨 Requesting recent donations...');
    socket.emit('request_recent_donations');
    
    console.log('📨 Requesting stats...');
    socket.emit('request_stats');
  }
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Closing connection...');
  socket.disconnect();
  process.exit(0);
});
