# PaymentAlert - Razorpay Integration with Real-time Overlay

A comprehensive Razorpay integration for donation payments with real-time Socket.IO broadcasting and a React/Vite overlay for OBS Browser Source.

## Features

### Backend
- **Multi-payment Method Support**: UPI, Card, Netbanking
- **Dynamic QR Code Generation**: Generate QR codes for UPI payments per order
- **UPI Autopay Mandates**: Create and manage recurring payment mandates
- **Webhook Integration**: Handle Razorpay webhooks for payment status updates
- **Real-time Broadcasting**: Socket.IO server for instant donation alerts
- **Tier-based Metadata**: Automatic donation tier calculation (Basic/Silver/Gold/Ultra)
- **Structured API Responses**: Return order metadata required by payment overlay
- **Input Validation**: Comprehensive validation using Joi
- **Database Persistence**: SQLite database for orders, payments, and mandates
- **Error Handling**: Proper error handling with Razorpay SDK errors

### Frontend Overlay
- **Real-time Alerts**: Socket.IO client with instant donation notifications
- **Animated Popups**: Tier-based animations with smooth entrance/exit effects
- **Audio/TTS Support**: Configurable sound alerts and text-to-speech
- **Recent Donations List**: Display last 5 donations with auto-scroll
- **Donation Goal Progress**: Visual progress bar with live updates
- **Theme Presets**: 4 customizable themes (Basic, Silver, Gold, Ultra)
- **OBS Compatible**: Transparent background, optimized for streaming

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd PaymentAlert
```

2. Install backend dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Razorpay credentials:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PORT=3000
NODE_ENV=development
DB_PATH=./payment.db
DONATION_GOAL=10000
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Overlay Setup

1. Navigate to overlay directory:
```bash
cd overlay
```

2. Install overlay dependencies:
```bash
npm install
```

3. Configure overlay environment:
```bash
cp .env.example .env
```

Edit `overlay/.env`:
```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
VITE_THEME=basic
VITE_DONATION_GOAL=10000
VITE_RECENT_DONATIONS_LIMIT=5
VITE_ENABLE_AUDIO=true
VITE_ENABLE_TTS=false
VITE_ANIMATION_DURATION=5000
```

4. Start the overlay development server:
```bash
npm run dev
```

The overlay will be available at `http://localhost:5173`

For detailed overlay setup and OBS configuration, see [overlay/README.md](overlay/README.md)

## API Endpoints

### Payment Orders

#### Create Order
```http
POST /api/payments/create-order
Content-Type: application/json

{
  "amount": 100.50,
  "currency": "INR",
  "contact": "+919876543210",
  "email": "donor@example.com",
  "description": "Monthly donation",
  "receipt": "receipt_123"
}
```

#### Create UPI QR Code
```http
POST /api/payments/create-upi-qr
Content-Type: application/json

{
  "order_id": "order_I7K7T9YqQz6dh9",
  "amount": 100.50
}
```

#### Create UPI Intent
```http
POST /api/payments/create-upi-intent
Content-Type: application/json

{
  "order_id": "order_I7K7T9YqQz6dh9",
  "amount": 100.50
}
```

### UPI Autopay Mandates

#### Create Mandate
```http
POST /api/payments/create-upi-mandate
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_contact": "+919876543210",
  "amount": 500.00,
  "frequency": "monthly",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "reference_id": "mandate_ref_123"
}
```

#### Get Mandate Status
```http
GET /api/payments/mandate/mandate_1704087832123_abc123def
```

#### Cancel Mandate
```http
POST /api/payments/cancel-mandate
Content-Type: application/json

{
  "mandate_id": "mandate_1704087832123_abc123def"
}
```

### Payment Verification

#### Verify Payment
```http
POST /api/payments/verify-payment
Content-Type: application/json

{
  "order_id": "order_I7K7T9YqQz6dh9",
  "payment_id": "pay_I7K7U2YqQz6dh9",
  "signature": "abc123..."
}
```

### Webhooks

#### Razorpay Webhook
```http
POST /api/webhooks/razorpay
Content-Type: application/json
x-razorpay-signature: webhook_signature
```

### Status and Configuration

#### Order Status
```http
GET /api/payments/status/order_I7K7T9YqQz6dh9
```

#### Overlay Configuration
```http
GET /api/overlay-config
```

#### Statistics
```http
GET /api/stats
```

#### Donation Goal
```http
GET /api/donation-goal
```

#### Recent Donations
```http
GET /api/recent-donations?limit=5
```

#### Socket.IO Status
```http
GET /api/socket-status
```

## Payment Flow

### 1. Normal UPI Payment
1. Create order via `/api/payments/create-order`
2. Get UPI intent via `/api/payments/create-upi-intent`
3. Customer completes payment using UPI apps
4. Verify payment via webhook or manual verification

### 2. QR Code UPI Payment
1. Create order via `/api/payments/create-order`
2. Generate QR code via `/api/payments/create-upi-qr`
3. Display QR code to customer for scanning
4. Payment status updated via webhook

### 3. UPI Autopay
1. Create mandate via `/api/payments/create-upi-mandate`
2. Customer authorizes mandate via auth_url
3. Recurring payments processed automatically
4. Monitor mandate status and handle cancellations

## Database Schema

### Orders Table
- `id`: Primary key
- `razorpay_order_id`: Unique Razorpay order ID
- `amount`: Payment amount
- `currency`: Currency (default: INR)
- `status`: Order status (created, paid, failed)
- `payment_method`: Method used for payment
- `contact`: Customer contact
- `email`: Customer email
- `description`: Order description
- `qr_code`: Generated QR code image
- `upi_intent`: UPI intent string

### Mandates Table
- `id`: Primary key
- `mandate_id`: Unique mandate identifier
- `razorpay_mandate_id`: Razorpay mandate ID
- `customer_name`: Customer name
- `customer_email`: Customer email
- `customer_contact`: Customer contact
- `amount`: Mandate amount
- `frequency`: Payment frequency
- `status`: Mandate status
- `auth_method`: Authentication method

### Payments Table
- `id`: Primary key
- `order_id`: Reference to orders table
- `razorpay_payment_id`: Razorpay payment ID
- `razorpay_order_id`: Razorpay order ID
- `status`: Payment status
- `amount`: Payment amount
- `method`: Payment method

## Socket.IO Real-time Events

The backend broadcasts the following Socket.IO events:

### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `connected` | Connection confirmation | `{ message, timestamp, clientId }` |
| `new_donation` | New verified donation | `{ id, order_id, amount, currency, donor_name, message, payment_method, tier, timestamp, metadata }` |
| `donation_basic` | Basic tier donation (₹1-499) | Same as new_donation |
| `donation_silver` | Silver tier donation (₹500-999) | Same as new_donation |
| `donation_gold` | Gold tier donation (₹1000-4999) | Same as new_donation |
| `donation_ultra` | Ultra tier donation (₹5000+) | Same as new_donation |
| `recent_donations` | Recent donations list | `{ donations: [...], timestamp }` |
| `stats_update` | Statistics update | `{ total_donations, total_amount, average_amount, highest_donation }` |
| `goal_progress` | Goal progress update | `{ current, goal, percentage, donations_count, timestamp }` |

### Client → Server Events

| Event | Description | Response |
|-------|-------------|----------|
| `request_recent_donations` | Request recent donations list | Emits `recent_donations` |
| `request_stats` | Request current statistics | Emits `stats_update` |

## Donation Tiers

Donations are automatically categorized into tiers based on amount:

| Tier | Amount Range | Theme Colors | Animation |
|------|--------------|--------------|-----------|
| **Basic** | ₹1 - ₹499 | Green | Slide In/Out |
| **Silver** | ₹500 - ₹999 | Silver Gradient | Bounce In |
| **Gold** | ₹1,000 - ₹4,999 | Gold Gradient + Glow | Zoom In/Out |
| **Ultra** | ₹5,000+ | Rainbow Gradient + Effects | Flip In/Out |

## Environment Configuration

### Backend Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Secret | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `DB_PATH` | Database path | No (default: ./payment.db) |
| `DONATION_GOAL` | Target donation goal | No (default: 10000) |

### Overlay Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOCKET_URL` | Socket.IO server URL | http://localhost:3000 |
| `VITE_API_URL` | API base URL | http://localhost:3000/api |
| `VITE_THEME` | Theme preset (basic/silver/gold/ultra) | basic |
| `VITE_DONATION_GOAL` | Donation goal amount | 10000 |
| `VITE_RECENT_DONATIONS_LIMIT` | Number of recent donations | 5 |
| `VITE_ENABLE_AUDIO` | Enable audio notifications | true |
| `VITE_ENABLE_TTS` | Enable text-to-speech | false |
| `VITE_ANIMATION_DURATION` | Popup duration (ms) | 5000 |

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

## Webhook Events

Supported webhook events:

- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `order.paid`: Order paid
- `upi.autopay.authorized`: Mandate authorized
- `upi.autopay.cancelled`: Mandate cancelled

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using HMAC signature
2. **Input Validation**: All inputs validated using Joi schemas
3. **CORS Configuration**: Proper CORS setup for production
4. **Environment Variables**: Sensitive data stored in environment variables
5. **Error Messages**: Sanitized error messages in production

## Development

### Backend Development

Run the backend in development mode with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Overlay Development

Run the overlay in development mode:

```bash
cd overlay
npm run dev
```

The overlay will start on `http://localhost:5173`

### Testing Socket.IO Integration

1. Start the backend server
2. Start the overlay in a browser
3. Trigger a test donation:

```bash
# Simulate a webhook for testing
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test_signature" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "id": "pay_test123",
        "order_id": "order_test123",
        "amount": 50000,
        "method": "upi"
      }
    }
  }'
```

Note: For webhook signature verification to pass, you'll need a valid signature or temporarily disable verification in development.

## Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins in `app.js`
3. Set up proper SSL certificates
4. Configure webhook URLs in Razorpay dashboard
5. Monitor logs and implement proper logging
6. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start app.js --name payment-alert
pm2 save
pm2 startup
```

### Overlay Deployment

1. Build the overlay for production:

```bash
cd overlay
npm run build
```

2. Serve the built files using a web server:

**Option A: Using a static file server**
```bash
npx serve dist -p 8080
```

**Option B: Using Nginx**
```nginx
server {
    listen 80;
    server_name overlay.yourdomain.com;
    
    location / {
        root /path/to/overlay/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

**Option C: Cloudflare Pages / Vercel / Netlify**
- Build command: `npm run build`
- Publish directory: `dist`

3. Update environment variables for production URLs
4. Configure OBS with the production overlay URL

### OBS Browser Source Setup

See [overlay/README.md](overlay/README.md) for detailed OBS configuration instructions.

## Testing

You can test the API using curl or Postman. Example curl commands:

```bash
# Create order
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "contact": "+919876543210", "email": "test@example.com"}'

# Generate QR code
curl -X POST http://localhost:3000/api/payments/create-upi-qr \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_123", "amount": 100}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License