# PaymentAlert - MongoDB Database Schema

A comprehensive MongoDB database schema implementation for a payment alert and donation management system, designed for streamers and content creators.

## 🎯 Overview

PaymentAlert provides a complete database layer for managing donations, user accounts, fraud detection, payment processing, and recurring payments. Built with MongoDB and Mongoose, it offers flexible schema design with strong type safety through TypeScript.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Seeding Data](#seeding-data)
- [API Documentation](#api-documentation)
- [Migration Guide](#migration-guide)

## ✨ Features

- **User Management**: Separate profiles for streamers and donors with role-based features
- **Donation Processing**: Complete donation lifecycle management with multiple payment methods
- **Fraud Detection**: Comprehensive fraud logging and investigation system
- **QR Code Orders**: Generate and manage QR codes for payments
- **Recurring Payments**: Autopay mandates and subscription management
- **Payment History**: Detailed transaction tracking and reporting
- **Admin System**: Multi-role admin accounts with granular permissions
- **Tier Management**: Streamer tier system with feature access control

## 🛠 Tech Stack

- **Database**: MongoDB 5.0+
- **ODM**: Mongoose 8.0+
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv

## 📊 Database Schema

### Collections Overview

1. **users** - Streamers and donors with comprehensive profiles
2. **admins** - Administrative accounts with role-based permissions
3. **donations** - Donation transactions and processing details
4. **fraudlogs** - Fraud detection and investigation records
5. **qrcodeorders** - QR code generation and management
6. **autopaymandates** - Recurring payment authorization
7. **recurringpayments** - Subscription and recurring payment tracking
8. **paymenthistories** - Complete payment transaction history

### Schema Details

For detailed schema documentation, see [Database Schema Documentation](./docs/DATABASE_SCHEMA.md).

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB 5.0+ (local or cloud instance)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd payment-alert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/payment_alert
   ADMIN_EMAIL=admin@paymentalert.com
   ADMIN_PASSWORD=Admin@123456
   ADMIN_USERNAME=superadmin
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/payment_alert` |
| `MONGODB_TEST_URI` | Test database URI | `mongodb://localhost:27017/payment_alert_test` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `ADMIN_EMAIL` | Super admin email | `admin@paymentalert.com` |
| `ADMIN_PASSWORD` | Super admin password | `Admin@123456` |
| `ADMIN_USERNAME` | Super admin username | `superadmin` |

### Database Connection Options

The database configuration includes optimized connection pooling:

- **Max Pool Size**: 10 connections
- **Min Pool Size**: 5 connections
- **Server Selection Timeout**: 5000ms
- **Socket Timeout**: 45000ms

## 💻 Usage

### Starting the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Build TypeScript
npm run build
```

### Database Operations

```typescript
import { connectDatabase } from './src/config/database';
import { User, Donation, Admin } from './src/models';

// Connect to database
await connectDatabase();

// Create a new user
const user = new User({
  username: 'streamer1',
  email: 'streamer1@example.com',
  password: 'SecurePassword123',
  role: 'STREAMER',
  displayName: 'Pro Streamer',
});
await user.save();

// Query donations
const donations = await Donation.find({ streamerId: user._id })
  .populate('donorId')
  .sort({ createdAt: -1 })
  .limit(10);
```

## 🌱 Seeding Data

### Seed Admin Accounts

```bash
npm run seed:admin
```

This creates 4 admin accounts with different roles:
- **Super Admin**: Full system access
- **Admin**: User and donation management
- **Moderator**: Read access and fraud investigation
- **Support**: Basic read access

### Seed Sample Data

```bash
# Set environment variable
export SEED_SAMPLE_DATA=true

# Run complete seed
npm run seed:all
```

This creates:
- 3 streamer accounts
- 5 donor accounts
- 10 sample donations
- QR codes for each streamer
- 2 autopay mandates
- 2 recurring payment subscriptions
- Payment history records

### Force Reseed

To clear existing data and reseed:

```bash
export FORCE_SEED=true
npm run seed:admin
```

⚠️ **Warning**: This will delete all existing admin accounts!

## 📚 API Documentation

### Models Export

All models are exported from a central location:

```typescript
import {
  User,
  Admin,
  Donation,
  FraudLog,
  QRCodeOrder,
  AutopayMandate,
  RecurringPayment,
  PaymentHistory
} from './src/models';
```

### Enums

All status enums and constants:

```typescript
import {
  UserRole,
  AdminRole,
  DonationStatus,
  PaymentMethod,
  PaymentGateway,
  QRCodeStatus,
  AutopayStatus,
  RecurringFrequency,
  FraudSeverity,
  FraudAction,
  TierLevel,
  AccountStatus,
  TransactionType
} from './src/utils/enums';
```

## 🔄 Migration Guide

### From Fresh Installation

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env`
3. Start MongoDB: Ensure MongoDB is running
4. Seed admin: `npm run seed:admin`
5. (Optional) Seed sample data: `SEED_SAMPLE_DATA=true npm run seed:all`

### Database Indexes

All required indexes are automatically created when the application starts. Key indexes include:

- **Users**: username, email, role, status
- **Donations**: donorId+transactionId, streamerId+status, status+createdAt
- **FraudLogs**: entityType+entityId, severity+isActive, userId+createdAt
- **QRCodeOrders**: qrCodeId, streamerId+status
- **AutopayMandates**: mandateId, donorId+streamerId, status+nextExecutionDate
- **RecurringPayments**: subscriptionId, status+nextPaymentDate
- **PaymentHistory**: transactionId, userId+status

### Backup and Restore

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/payment_alert" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/payment_alert" ./backup/payment_alert
```

## 🔒 Security Considerations

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 10 (users) or 12 (admins)
2. **Sensitive Data**: Bank account numbers are marked with `select: false`
3. **Account Locking**: Failed login attempts trigger account locks
4. **Two-Factor Auth**: Support for 2FA flag on admin and user accounts
5. **Environment Variables**: Never commit `.env` files

## 📁 Project Structure

```
payment-alert/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection
│   ├── models/
│   │   ├── User.ts              # User/Streamer model
│   │   ├── Admin.ts             # Admin model
│   │   ├── Donation.ts          # Donation model
│   │   ├── FraudLog.ts          # Fraud detection model
│   │   ├── QRCodeOrder.ts       # QR code model
│   │   ├── AutopayMandate.ts    # Autopay model
│   │   ├── RecurringPayment.ts  # Recurring payment model
│   │   ├── PaymentHistory.ts    # Payment history model
│   │   └── index.ts             # Model exports
│   ├── seeds/
│   │   ├── adminSeed.ts         # Admin seed script
│   │   ├── sampleDataSeed.ts    # Sample data seed
│   │   └── index.ts             # Seed orchestrator
│   ├── utils/
│   │   └── enums.ts             # Enums and constants
│   └── index.ts                 # Application entry
├── docs/
│   ├── DATABASE_SCHEMA.md       # Detailed schema docs
│   └── MIGRATION_GUIDE.md       # Migration instructions
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Formatting
npm run format
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@paymentalert.com

## 🗺 Roadmap

- [ ] Add data validation middleware
- [ ] Implement webhook models
- [ ] Add analytics aggregation
- [ ] Create migration scripts
- [ ] Add comprehensive tests
- [ ] Performance optimization
- [ ] Add audit logging

---

**Built with ❤️ for streamers and content creators**
