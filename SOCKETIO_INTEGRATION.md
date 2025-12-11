# Socket.IO Real-time Donation Broadcasting

This document details the Socket.IO integration for real-time donation alerts in the Payment Alert system.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Razorpay   │ webhook │   Backend    │ Socket  │   Overlay   │
│  Payment    │────────▶│   Express    │◀───────▶│   React     │
│  Gateway    │         │   + Socket   │         │   Client    │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │ SQLite
                               ▼
                        ┌──────────────┐
                        │   Database   │
                        │   Orders     │
                        │   Payments   │
                        └──────────────┘
```

## Flow Diagram

1. **Payment Received** → Razorpay sends webhook
2. **Webhook Verified** → Signature validation
3. **Database Updated** → Order marked as "paid"
4. **Socket.IO Broadcast** → Donation event emitted
5. **Overlay Receives** → React component updates
6. **Animation Plays** → Tier-based popup displayed
7. **List Updated** → Recent donations refreshed

## Implementation Details

### Backend (app.js)

```javascript
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { ... } });

socketService.initialize(io);
```

### Socket Service (models/SocketService.js)

**Key Methods:**
- `initialize(io)` - Setup Socket.IO event handlers
- `emitDonation(paymentData)` - Broadcast donation to all clients
- `determineDonationTier(amount)` - Calculate tier from amount
- `getRecentDonations(limit)` - Query recent donations
- `getStats()` - Aggregate donation statistics

**Tier Logic:**
```javascript
determineDonationTier(amount) {
  if (amount >= 5000) return 'ultra';
  if (amount >= 1000) return 'gold';
  if (amount >= 500) return 'silver';
  return 'basic';
}
```

### Webhook Integration (models/RazorpayService.js)

When a payment is captured:
```javascript
async handlePaymentCaptured(payment) {
  await database.updateOrderStatus(payment.order_id, 'paid', payment.method);
  await database.createPayment({ ... });
  
  // Emit to Socket.IO
  await socketService.emitDonation({
    razorpay_payment_id: payment.id,
    order_id: payment.order_id,
    method: payment.method
  });
}
```

### Frontend Hook (overlay/src/hooks/useSocket.js)

```javascript
const { socket, connected, donations, stats } = useSocket();

useEffect(() => {
  socketInstance.on('new_donation', (donation) => {
    setDonations((prev) => [donation, ...prev]);
  });
}, []);
```

## Event Specifications

### Server → Client Events

#### `connected`
**Sent:** On client connection
**Payload:**
```json
{
  "message": "Connected to Payment Alert Service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "clientId": "abc123def456"
}
```

#### `new_donation`
**Sent:** When payment is captured
**Payload:**
```json
{
  "id": "pay_ABC123xyz",
  "order_id": "order_XYZ789abc",
  "amount": 1500,
  "currency": "INR",
  "donor_name": "+919876543210",
  "message": "Keep up the great work!",
  "payment_method": "upi",
  "tier": "gold",
  "timestamp": "2024-01-15T10:30:15.000Z",
  "metadata": {
    "email": "donor@example.com",
    "contact": "+919876543210"
  }
}
```

#### `donation_{tier}`
**Sent:** Tier-specific event (basic/silver/gold/ultra)
**Payload:** Same as `new_donation`

#### `recent_donations`
**Sent:** On request or after new donation
**Payload:**
```json
{
  "donations": [
    {
      "razorpay_order_id": "order_123",
      "amount": 1500,
      "currency": "INR",
      "contact": "+919876543210",
      "email": "donor@example.com",
      "description": "Great stream!",
      "payment_method": "upi",
      "created_at": "2024-01-15T10:30:15.000Z",
      "updated_at": "2024-01-15T10:30:20.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

#### `stats_update`
**Sent:** After new donation or on request
**Payload:**
```json
{
  "total_donations": 25,
  "total_amount": 15750,
  "average_amount": 630,
  "highest_donation": 5000
}
```

#### `goal_progress`
**Sent:** When goal progress is broadcast
**Payload:**
```json
{
  "current": 15750,
  "goal": 50000,
  "percentage": 31.5,
  "donations_count": 25,
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

### Client → Server Events

#### `request_recent_donations`
**Purpose:** Fetch recent donations list
**Payload:** None
**Response:** Emits `recent_donations` event

#### `request_stats`
**Purpose:** Fetch current statistics
**Payload:** None
**Response:** Emits `stats_update` event

## Testing Socket.IO

### Method 1: Using the Test Client

```bash
node test-socketio.js
```

This will:
- Connect to Socket.IO server
- Request recent donations and stats
- Listen for all donation events
- Display formatted output

### Method 2: Using Browser Console

Open the overlay in a browser and run:
```javascript
// Check connection status
console.log('Connected:', socket.connected);

// Request recent donations
socket.emit('request_recent_donations');

// Request stats
socket.emit('request_stats');

// Listen for events
socket.on('new_donation', (donation) => {
  console.log('Donation:', donation);
});
```

### Method 3: Simulating Webhooks

Create a test donation and trigger webhook:

```bash
# 1. Insert test order
sqlite3 payment.db "INSERT INTO orders (razorpay_order_id, amount, currency, status, contact, email, description, payment_method) VALUES ('order_test_gold', 2000, 'INR', 'created', 'Test User', 'test@example.com', 'Gold tier test!', 'upi')"

# 2. Trigger webhook (requires valid signature or disabled verification)
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test_sig" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "id": "pay_test_gold",
        "order_id": "order_test_gold",
        "amount": 200000,
        "method": "upi"
      }
    }
  }'
```

## Monitoring

### Check Connected Clients

```bash
curl http://localhost:3000/api/socket-status
```

Response:
```json
{
  "success": true,
  "data": {
    "connected_clients": 2,
    "timestamp": "2024-01-15T10:31:00.000Z"
  }
}
```

### Backend Logs

The backend logs Socket.IO activity:
```
🔌 Overlay connected: abc123def456
💰 Broadcasting donation: 1500 INR (gold tier)
🔌 Overlay disconnected: abc123def456
```

### Frontend Logs

The overlay logs received events:
```
🔌 Connected to Socket.IO server
💰 New donation received: { amount: 1500, tier: 'gold', ... }
Recent donations received: { donations: [...] }
```

## Performance Considerations

### Connection Management
- Automatic reconnection on disconnect
- Exponential backoff for reconnection attempts
- Client-side connection pooling

### Broadcasting Efficiency
- Events only sent to connected clients
- Minimal payload size
- Tier-specific event subscription possible

### Memory Management
- Recent donations limited to 5 items in overlay state
- Automatic cleanup of old donation popups
- No memory leaks in event listeners

## Security

### CORS Configuration
```javascript
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

### Best Practices
- ✅ Validate all incoming events
- ✅ Sanitize data before broadcasting
- ✅ Rate limiting on client requests
- ✅ Authentication for sensitive operations
- ✅ HTTPS in production

## Troubleshooting

### Issue: Clients not receiving events

**Check:**
1. Backend Socket.IO is initialized
2. Client connection successful (check connection status)
3. CORS settings allow the client origin
4. Firewall not blocking WebSocket connections

**Debug:**
```javascript
// Enable Socket.IO debug logs
localStorage.debug = 'socket.io-client:*';
```

### Issue: Multiple duplicate events

**Cause:** Multiple Socket.IO initialization or event listeners not cleaned up

**Fix:**
- Use `useEffect` cleanup in React
- Ensure single Socket.IO instance
- Remove old listeners before adding new ones

### Issue: Connection drops frequently

**Check:**
1. Network stability
2. Server not restarting
3. Client-side keep-alive settings
4. Load balancer WebSocket support (if applicable)

## Production Deployment

### Backend Configuration
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});
```

### Frontend Configuration
```javascript
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

### Nginx Configuration
```nginx
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Scaling Considerations

For multiple server instances:

1. **Redis Adapter**
```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

2. **Sticky Sessions** (Load Balancer)
Ensure requests from same client go to same server

3. **Horizontal Scaling**
Use Redis pub/sub to broadcast events across servers

## Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [React Socket.IO Integration](https://socket.io/how-to/use-with-react)
- [OBS WebSocket Guide](https://obsproject.com/kb/browser-source)

## Support

For issues or questions about Socket.IO integration:
1. Check backend logs for connection/broadcast errors
2. Check browser console for client-side errors
3. Use the test client to verify server functionality
4. Review this documentation for configuration details
