# PaymentAlert - Razorpay Integration

A comprehensive Razorpay integration for donation payments supporting UPI, card, netbanking, QR codes, and UPI Autopay mandates.

## Features

- **Multi-payment Method Support**: UPI, Card, Netbanking
- **Dynamic QR Code Generation**: Generate QR codes for UPI payments per order
- **UPI Autopay Mandates**: Create and manage recurring payment mandates
- **Webhook Integration**: Handle Razorpay webhooks for payment status updates
- **Structured API Responses**: Return order metadata required by payment overlay
- **Input Validation**: Comprehensive validation using Joi
- **Database Persistence**: SQLite database for orders, payments, and mandates
- **Error Handling**: Proper error handling with Razorpay SDK errors

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PaymentAlert
```

2. Install dependencies:
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
```

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

## Environment Configuration

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Secret | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `DB_PATH` | Database path | No (default: ./payment.db) |

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

Run the application in development mode:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up proper SSL certificates
4. Configure webhook URLs in Razorpay dashboard
5. Monitor logs and implement proper logging

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