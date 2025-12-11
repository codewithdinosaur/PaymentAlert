# Payment Alert Backend

A production-ready Node.js/Express backend with TypeScript, featuring real-time Socket.IO notifications, MongoDB integration, Razorpay payment processing, and comprehensive security measures.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework for Node.js
- **TypeScript** - Type-safe development with strict configuration
- **Socket.IO** - Real-time bidirectional event-based communication
- **MongoDB** - Document database with Mongoose ODM
- **Razorpay Integration** - Payment processing and webhook handling
- **Winston Logger** - Structured logging with file rotation
- **Security Middleware** - Helmet, CORS, rate limiting, compression
- **Health Checks** - Comprehensive health monitoring endpoints
- **Docker Support** - Multi-stage Dockerfile and Docker Compose
- **Development Tools** - ESLint, Prettier, Nodemon for hot reloading

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Docker)
- Razorpay account (for payment processing)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd payment-alert-backend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/payment_alert_dev

# Razorpay (get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Security
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Install and start MongoDB locally
# Ubuntu/Debian: sudo apt-get install mongodb
# macOS: brew install mongodb-community
# Windows: Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

**Option B: Docker MongoDB**
```bash
# Start MongoDB using Docker Compose
docker-compose -f docker-compose.dev.yml up -d mongodb
```

### 4. Generate JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚦 Running the Application

### Development Mode

```bash
# Start with hot reload using nodemon
npm run dev

# Or start normally
npm run dev:node
```

### Production Build

```bash
# Build the application
npm run build

# Start the built application
npm start

# Or start with production environment
npm run start:prod
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Or build and start only backend and database
docker-compose up -d backend mongodb

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 📊 API Endpoints

### Health Checks
```bash
# Basic health check
GET /health
GET /api/health

# Detailed health check with system info
GET /health/detailed

# Simple ping
GET /health/ping
```

### API Information
```bash
# Get API information
GET /api

# Root endpoint
GET /
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Payment Alert Backend API",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "endpoints": {
    "health": "/health",
    "healthDetailed": "/health/detailed",
    "ping": "/health/ping"
  }
}
```

## 🔧 Development Tools

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run typecheck

# Clean build directory
npm run clean
```

### Pre-commit Hooks

The project includes ESLint and Prettier integration. Consider setting up pre-commit hooks:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Set up pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint:fix && npm run format"
```

## 🏗️ Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment validation
│   │   ├── logger.ts     # Winston logger setup
│   │   ├── database.ts   # MongoDB connection
│   │   └── razorpay.ts   # Razorpay configuration
│   ├── controllers/      # Route controllers
│   │   └── healthController.ts
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   ├── rateLimiter.ts
│   │   └── cors.ts
│   ├── routes/           # Express routes
│   │   └── healthRoutes.ts
│   ├── services/         # Business logic services
│   │   └── socketService.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Main application entry point
├── logs/                 # Log files
├── dist/                 # Built application (generated)
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
├── tsconfig.json        # TypeScript configuration
├── nodemon.json         # Nodemon configuration
└── package.json         # Dependencies and scripts
```

## 🔌 Socket.IO Events

### Client Events (Incoming)

```javascript
// User identification
socket.emit('identify', userId);

// Join payment room for updates
socket.emit('payment-subscribe', paymentId);

// Leave payment room
socket.emit('payment-unsubscribe', paymentId);

// Join custom room
socket.emit('join-room', roomId);

// Leave room
socket.emit('leave-room', roomId);
```

### Server Events (Outgoing)

```javascript
// Payment status updates
socket.on('payment-update', (data) => {
  console.log('Payment update:', data);
});

// General notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

## 🐳 Docker Configuration

### Development
```bash
# Start MongoDB for development
docker-compose -f docker-compose.dev.yml up -d

# The backend runs locally with npm run dev
npm run dev
```

### Production
```bash
# Build and start all services
docker-compose up -d

# Services included:
# - mongodb: MongoDB database
# - redis: Redis for caching
# - backend: Payment Alert backend
# - nginx: Reverse proxy (optional)
```

### Environment Variables in Docker

Update `docker-compose.yml` with your actual values:

```yaml
environment:
  RAZORPAY_KEY_ID: your_actual_key_id
  RAZORPAY_KEY_SECRET: your_actual_key_secret
  RAZORPAY_WEBHOOK_SECRET: your_actual_webhook_secret
  JWT_SECRET: your_actual_jwt_secret
```

## 📈 Monitoring & Health Checks

### Health Check Response

The `/health` endpoint provides:

- **Database Connection Status**
- **Memory Usage Statistics**
- **System Uptime**
- **Node.js Version Information**
- **Application Environment**

### Logging

Logs are written to:
- `logs/combined.log` - All log levels
- `logs/error.log` - Error level only
- Console output (development)

### Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **API Routes**: 20 requests per 15 minutes per IP
- **Auth Routes**: 5 requests per 15 minutes per IP

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - DDoS protection
- **Input Validation** - Environment variable validation
- **Error Handling** - Secure error responses
- **Non-root Docker User** - Container security

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Unhandled Promise Rejections**
- **Uncaught Exceptions**
- **Database Connection Errors**
- **Invalid Environment Variables**
- **Request Validation Errors**

All errors are logged using Winston and returned in a consistent format.

## 📝 Razorpay Integration

### Webhook Handling

```typescript
// Example webhook endpoint (to be implemented)
POST /api/webhooks/razorpay
```

### Payment Processing

```typescript
// Example payment creation (to be implemented)
POST /api/payments/create
```

## 🔄 Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Hot reload** automatically restarts the server
3. **Linting** runs on file changes
4. **Test endpoints** using the health check
5. **Check logs** for debugging information

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Docker Documentation](https://docs.docker.com/)

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Or use Docker
docker ps | grep mongo
```

**2. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**3. Environment Variables Not Loaded**
```bash
# Ensure .env file exists and has correct format
cat .env

# Check if dotenv is imported in your code
```

**4. Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Logs

Check application logs:
```bash
# Development logs
npm run dev

# Docker logs
docker-compose logs -f backend

# Log files
tail -f logs/combined.log
```

## 🤝 Contributing

1. Follow the existing code style
2. Run linting and formatting before commits
3. Test health check endpoints after changes
4. Update documentation for new features

## 📄 License

This project is licensed under the MIT License.
