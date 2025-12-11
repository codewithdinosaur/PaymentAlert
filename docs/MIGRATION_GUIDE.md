# Migration and Setup Guide

This guide provides step-by-step instructions for setting up and migrating the PaymentAlert database.

## Table of Contents

1. [Fresh Installation](#fresh-installation)
2. [Development Setup](#development-setup)
3. [Production Setup](#production-setup)
4. [Database Migration](#database-migration)
5. [Backup and Restore](#backup-and-restore)
6. [Troubleshooting](#troubleshooting)

---

## Fresh Installation

### Prerequisites

Before starting, ensure you have:

- **Node.js** 18.0.0 or higher
- **MongoDB** 5.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd payment-alert
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- mongoose
- dotenv
- bcryptjs
- TypeScript and related tools

### Step 3: Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/payment_alert
MONGODB_TEST_URI=mongodb://localhost:27017/payment_alert_test

# Application
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your-secure-jwt-secret-change-this
ENCRYPTION_KEY=your-secure-encryption-key-change-this

# Admin Seed
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_USERNAME=superadmin
```

### Step 4: Start MongoDB

Ensure MongoDB is running:

```bash
# If using system service
sudo systemctl start mongod

# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify connection
mongosh --eval "db.version()"
```

### Step 5: Build Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Step 6: Seed Initial Data

Create admin accounts:

```bash
npm run seed:admin
```

This creates four admin accounts:
- Super Admin (full access)
- Admin (management access)
- Moderator (review access)
- Support (read-only access)

**Important**: Note the credentials displayed after seeding!

### Step 7: (Optional) Seed Sample Data

For development/testing, seed sample data:

```bash
export SEED_SAMPLE_DATA=true
npm run seed:all
```

This creates:
- 3 streamer accounts
- 5 donor accounts
- 10 sample donations
- QR codes
- Autopay mandates
- Recurring payments

### Step 8: Start Application

```bash
# Development mode with auto-reload
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

---

## Development Setup

### Using Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: payment_alert_db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: payment_alert
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d

  app:
    build: .
    container_name: payment_alert_app
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/payment_alert?authSource=admin
      NODE_ENV: development
    depends_on:
      - mongodb
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

Start services:

```bash
docker-compose up -d
```

### Development Workflow

1. **Install dependencies**: `npm install`
2. **Start in watch mode**: `npm run dev`
3. **Make changes**: Edit TypeScript files
4. **Auto-reload**: Changes trigger automatic restart
5. **Test**: Run tests with `npm test`

### IDE Setup

#### VS Code

Install recommended extensions:
- ESLint
- Prettier
- MongoDB for VS Code

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Production Setup

### Environment Preparation

1. **Set production environment variables**:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payment_alert?retryWrites=true&w=majority

# Strong security keys
JWT_SECRET=<generate-strong-random-key>
ENCRYPTION_KEY=<generate-strong-random-key>

# Production admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-unique-password>
```

2. **Generate secure keys**:

```bash
# JWT Secret (64 characters)
openssl rand -base64 64

# Encryption Key (32 characters)
openssl rand -base64 32
```

### MongoDB Atlas Setup

1. **Create Atlas account**: Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster**:
   - Choose cloud provider and region
   - Select cluster tier (M10+ for production)
   - Configure database name: `payment_alert`

3. **Configure network access**:
   - Add IP whitelist (or 0.0.0.0/0 for cloud deployments)
   - Configure VPC peering if needed

4. **Create database user**:
   - Username: `payment_alert_app`
   - Strong password
   - Role: `readWrite` on `payment_alert` database

5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy MongoDB URI
   - Replace `<password>` with your password

### Deployment Steps

#### Using PM2

1. **Install PM2**:

```bash
npm install -g pm2
```

2. **Create ecosystem file** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'payment-alert',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
```

3. **Deploy**:

```bash
# Build
npm run build

# Seed production admin
npm run seed:admin

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

4. **Monitor**:

```bash
pm2 status
pm2 logs payment-alert
pm2 monit
```

#### Using Docker

1. **Create Dockerfile**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

2. **Build and run**:

```bash
docker build -t payment-alert .
docker run -d \
  --name payment-alert \
  -p 3000:3000 \
  --env-file .env \
  payment-alert
```

### Post-Deployment

1. **Verify connection**:

```bash
# Check logs
pm2 logs payment-alert

# Test database
mongosh "your-mongodb-uri" --eval "db.adminCommand('ping')"
```

2. **Create indexes**:

Indexes are created automatically, but verify:

```bash
mongosh "your-mongodb-uri" --eval "db.users.getIndexes()"
```

3. **Health check**:

Create a health check endpoint and monitor it.

4. **Backup setup**:

Configure automated backups (see [Backup section](#backup-and-restore)).

---

## Database Migration

### Version Control for Schema Changes

When making schema changes:

1. **Create migration script** (`migrations/001_add_field.ts`):

```typescript
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import User from '../src/models/User';

export async function up() {
  await connectDatabase();
  
  // Add new field to existing documents
  await User.updateMany(
    { newField: { $exists: false } },
    { $set: { newField: 'defaultValue' } }
  );
  
  console.log('Migration completed');
  await disconnectDatabase();
}

export async function down() {
  await connectDatabase();
  
  // Rollback changes
  await User.updateMany(
    {},
    { $unset: { newField: '' } }
  );
  
  console.log('Rollback completed');
  await disconnectDatabase();
}
```

2. **Run migration**:

```bash
ts-node migrations/001_add_field.ts
```

### Schema Version Tracking

Create a migrations collection:

```typescript
// models/Migration.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IMigration extends Document {
  version: number;
  name: string;
  appliedAt: Date;
}

const MigrationSchema = new Schema<IMigration>({
  version: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMigration>('Migration', MigrationSchema);
```

### Common Migration Patterns

#### Adding a Field

```javascript
db.users.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: 'default' } }
)
```

#### Renaming a Field

```javascript
db.users.updateMany(
  {},
  { $rename: { 'oldName': 'newName' } }
)
```

#### Changing Field Type

```javascript
db.donations.find({ amount: { $type: 'string' } }).forEach(doc => {
  db.donations.updateOne(
    { _id: doc._id },
    { $set: { amount: parseFloat(doc.amount) } }
  )
})
```

#### Adding Index

```javascript
db.users.createIndex({ email: 1, username: 1 })
```

---

## Backup and Restore

### Manual Backup

#### Full Database Backup

```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/payment_alert" --out=./backups/$(date +%Y%m%d)

# Backup with gzip compression
mongodump --uri="mongodb://localhost:27017/payment_alert" --gzip --out=./backups/$(date +%Y%m%d)
```

#### Collection-Specific Backup

```bash
# Backup single collection
mongodump --uri="mongodb://localhost:27017/payment_alert" --collection=users --out=./backups/users
```

#### Backup to Archive

```bash
# Create single archive file
mongodump --uri="mongodb://localhost:27017/payment_alert" --archive=./backups/payment_alert.$(date +%Y%m%d).archive --gzip
```

### Restore

#### Full Restore

```bash
# Restore from directory
mongorestore --uri="mongodb://localhost:27017/payment_alert" ./backups/20241211

# Restore from archive
mongorestore --uri="mongodb://localhost:27017/payment_alert" --archive=./backups/payment_alert.20241211.archive --gzip
```

#### Collection-Specific Restore

```bash
mongorestore --uri="mongodb://localhost:27017/payment_alert" --collection=users ./backups/users/payment_alert/users.bson
```

#### Drop Before Restore

```bash
# Drop existing data before restore
mongorestore --uri="mongodb://localhost:27017/payment_alert" --drop ./backups/20241211
```

### Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="payment_alert"
DB_URI="mongodb://localhost:27017"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup
mongodump \
  --uri="${DB_URI}/${DB_NAME}" \
  --archive="${BACKUP_DIR}/${DB_NAME}_${DATE}.archive" \
  --gzip

# Remove old backups
find ${BACKUP_DIR} -name "${DB_NAME}_*.archive" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${DB_NAME}_${DATE}.archive"
```

Make executable and schedule:

```bash
chmod +x scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/scripts/backup.sh >> /var/log/mongodb-backup.log 2>&1
```

### Cloud Backup (MongoDB Atlas)

MongoDB Atlas provides automated backups:

1. **Enable continuous backup**:
   - Atlas UI → Cluster → Backup
   - Enable continuous cloud backup
   - Configure retention policy

2. **Restore from backup**:
   - Select restore point
   - Choose restore type (cluster/download)
   - Monitor restoration progress

---

## Troubleshooting

### Connection Issues

#### Problem: Cannot connect to MongoDB

**Solutions**:

1. **Check MongoDB is running**:
```bash
sudo systemctl status mongod
```

2. **Verify connection string**:
```bash
mongosh "mongodb://localhost:27017/payment_alert"
```

3. **Check firewall**:
```bash
sudo ufw allow 27017
```

4. **Test network connectivity**:
```bash
telnet localhost 27017
```

### Authentication Errors

#### Problem: Authentication failed

**Solutions**:

1. **Verify credentials**:
```bash
mongosh "mongodb://username:password@localhost:27017/payment_alert"
```

2. **Check user permissions**:
```javascript
use payment_alert
db.getUsers()
```

3. **Create user if missing**:
```javascript
use payment_alert
db.createUser({
  user: "payment_alert_app",
  pwd: "your_password",
  roles: [{ role: "readWrite", db: "payment_alert" }]
})
```

### Performance Issues

#### Problem: Slow queries

**Solutions**:

1. **Check indexes**:
```javascript
db.users.getIndexes()
```

2. **Explain query**:
```javascript
db.users.find({ email: "test@example.com" }).explain("executionStats")
```

3. **Create missing indexes**:
```javascript
db.users.createIndex({ email: 1 })
```

4. **Monitor performance**:
```bash
mongosh --eval "db.currentOp()"
```

### Seed Script Issues

#### Problem: Seed script fails

**Solutions**:

1. **Clear existing data**:
```bash
export FORCE_SEED=true
npm run seed:admin
```

2. **Check MongoDB logs**:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

3. **Verify environment variables**:
```bash
env | grep MONGODB
```

### Memory Issues

#### Problem: High memory usage

**Solutions**:

1. **Limit connection pool**:
```typescript
// In database.ts
const options = {
  maxPoolSize: 5,  // Reduce from 10
  minPoolSize: 2,  // Reduce from 5
};
```

2. **Monitor memory**:
```bash
mongosh --eval "db.serverStatus().mem"
```

3. **Enable profiler**:
```javascript
db.setProfilingLevel(2)
db.system.profile.find().limit(10).sort({ ts: -1 })
```

---

## Best Practices

### Security

1. **Use environment variables** for sensitive data
2. **Enable SSL/TLS** for MongoDB connections in production
3. **Implement IP whitelisting**
4. **Use strong passwords** (min 16 characters, mixed case, numbers, symbols)
5. **Enable MongoDB authentication**
6. **Regular security audits**

### Monitoring

1. **Set up logging** (Winston, Morgan)
2. **Monitor database metrics** (CPU, memory, connections)
3. **Set up alerts** for critical issues
4. **Track query performance**
5. **Monitor backup success**

### Maintenance

1. **Regular backups** (automated daily)
2. **Index optimization** (review quarterly)
3. **Data archiving** (move old data)
4. **Database compaction** (reduce fragmentation)
5. **Update dependencies** (security patches)

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Last Updated**: December 2024
