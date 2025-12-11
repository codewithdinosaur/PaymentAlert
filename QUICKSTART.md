# Quick Start Guide

Get PaymentAlert up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB 5+ installed and running
- Terminal access

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local MongoDB):
```env
MONGODB_URI=mongodb://localhost:27017/payment_alert
```

### 3. Start MongoDB

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not running, start it
sudo systemctl start mongod
```

### 4. Build the Project

```bash
npm run build
```

### 5. Seed Admin Accounts

```bash
npm run seed:admin
```

**Important**: Save the admin credentials displayed!

Default credentials:
- **Super Admin**: superadmin@paymentalert.com / Admin@123456
- **Admin**: admin2@paymentalert.com / Admin@123456
- **Moderator**: moderator@paymentalert.com / Moderator@123456
- **Support**: support@paymentalert.com / Support@123456

### 6. (Optional) Add Sample Data

```bash
export SEED_SAMPLE_DATA=true
npm run seed:all
```

This creates:
- 3 streamer accounts (streamer1, streamer2, streamer3)
- 5 donor accounts (donor1-5)
- 10 sample donations
- QR codes for each streamer
- 2 autopay mandates
- 2 recurring payments

Sample user credentials:
- **Username**: streamer1 / donor1
- **Password**: Streamer@123456 / Donor@123456

### 7. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
📍 Database: payment_alert
🚀 PaymentAlert Application Started
```

## Verify Installation

### Check Database

```bash
mongosh mongodb://localhost:27017/payment_alert
```

In MongoDB shell:
```javascript
// Check collections
show collections

// Count users
db.users.countDocuments()

// Count admins
db.admins.countDocuments()

// View a streamer
db.users.findOne({ role: "STREAMER" })
```

### Test Connection

```typescript
// test-connection.ts
import { connectDatabase } from './src/config/database';
import { User } from './src/models';

async function test() {
  await connectDatabase();
  const users = await User.find().limit(5);
  console.log('Users:', users);
  process.exit(0);
}

test();
```

Run:
```bash
ts-node test-connection.ts
```

## Next Steps

1. **Read Documentation**
   - [README.md](./README.md) - Full documentation
   - [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Schema details
   - [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) - Setup and migration

2. **Explore Models**
   - Located in `src/models/`
   - All models exported from `src/models/index.ts`

3. **Customize Configuration**
   - Edit `.env` for your environment
   - Adjust database connection options in `src/config/database.ts`

4. **Build Your Application**
   - Import models: `import { User, Donation } from './src/models'`
   - Import enums: `import { UserRole, DonationStatus } from './src/utils/enums'`

## Common Commands

```bash
# Development
npm run dev              # Start with auto-reload

# Production
npm run build           # Build TypeScript
npm start               # Start production server

# Database
npm run seed:admin      # Seed admin accounts
npm run seed:all        # Seed all data

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Testing
npm test                # Run tests (when implemented)
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongosh --eval "db.version()"
```

### Port Already in Use

Change PORT in `.env`:
```env
PORT=3001
```

### Seed Script Fails

Force reseed (⚠️ destroys existing data):
```bash
export FORCE_SEED=true
npm run seed:admin
```

### TypeScript Errors

```bash
# Clean build
rm -rf dist/
npm run build
```

## Need Help?

- 📚 [Full Documentation](./README.md)
- 🗄️ [Database Schema](./docs/DATABASE_SCHEMA.md)
- 🔄 [Migration Guide](./docs/MIGRATION_GUIDE.md)
- 🐛 [Open an Issue](https://github.com/your-repo/issues)

---

**You're all set!** 🎉 Start building with PaymentAlert!
