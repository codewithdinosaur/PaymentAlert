# Database Schema Documentation

This document provides detailed information about all collections in the PaymentAlert database.

## Table of Contents

1. [Users Collection](#users-collection)
2. [Admins Collection](#admins-collection)
3. [Donations Collection](#donations-collection)
4. [FraudLogs Collection](#fraudlogs-collection)
5. [QRCodeOrders Collection](#qrcodeorders-collection)
6. [AutopayMandates Collection](#autopaymandates-collection)
7. [RecurringPayments Collection](#recurringpayments-collection)
8. [PaymentHistories Collection](#paymenthistories-collection)

---

## Users Collection

The `users` collection stores information for both streamers and donors.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `username` | String | ✓ | Unique username (3-30 chars, lowercase) |
| `email` | String | ✓ | Unique email address (lowercase) |
| `password` | String | ✓ | Hashed password (min 8 chars) |
| `role` | String | ✓ | User role: STREAMER, DONOR, or BOTH |
| `displayName` | String | ✓ | Display name (max 50 chars) |
| `avatar` | String | | Profile picture URL |
| `bio` | String | | User bio (max 500 chars) |
| `status` | String | ✓ | Account status |
| `isEmailVerified` | Boolean | ✓ | Email verification status |
| `isPhoneVerified` | Boolean | ✓ | Phone verification status |
| `phoneNumber` | String | | Phone number |
| `twoFactorEnabled` | Boolean | ✓ | 2FA status |
| `lastLogin` | Date | | Last login timestamp |
| `loginAttempts` | Number | ✓ | Failed login count |
| `lockUntil` | Date | | Account lock expiry |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Streamer Profile

Additional fields when role includes STREAMER:

| Field | Type | Description |
|-------|------|-------------|
| `streamerProfile.streamingPlatforms` | Array | List of streaming platforms |
| `streamerProfile.paymentSettings` | Object | Payment configuration |
| `streamerProfile.alertSettings` | Object | Alert display settings |
| `streamerProfile.tier` | Object | Subscription tier information |
| `streamerProfile.stats` | Object | Donation statistics |

#### Payment Settings

```typescript
{
  upiId: string,
  qrCodeEnabled: boolean,
  minDonationAmount: number,    // default: 10
  maxDonationAmount: number,    // default: 100000
  allowAnonymous: boolean,      // default: true
  showDonorList: boolean        // default: true
}
```

#### Alert Settings

```typescript
{
  soundEnabled: boolean,        // default: true
  minAmountForAlert: number,    // default: 10
  displayDuration: number,      // default: 5 seconds
  customMessage: string
}
```

#### Tier Structure

```typescript
{
  level: TierLevel,            // FREE, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
  features: string[],
  expiresAt: Date
}
```

### Donor Profile

Additional fields when role includes DONOR:

| Field | Type | Description |
|-------|------|-------------|
| `donorProfile.totalDonationsGiven` | Number | Total donation count |
| `donorProfile.totalAmountGiven` | Number | Total amount donated |
| `donorProfile.favoriteStreamers` | ObjectId[] | Favorite streamer IDs |
| `donorProfile.preferredPaymentMethod` | String | Preferred payment method |

### Indexes

- `username` (unique)
- `email` (unique)
- `username + email` (compound)
- `streamerProfile.tier.level`
- `status + role` (compound)
- `createdAt` (descending)

### Enums

**UserRole**: `STREAMER`, `DONOR`, `BOTH`

**AccountStatus**: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `BANNED`, `PENDING_VERIFICATION`

**TierLevel**: `FREE`, `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND`

---

## Admins Collection

The `admins` collection stores administrative user accounts.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `username` | String | ✓ | Unique username |
| `email` | String | ✓ | Unique email address |
| `password` | String | ✓ | Hashed password (bcrypt, 12 rounds) |
| `role` | String | ✓ | Admin role level |
| `fullName` | String | ✓ | Full name (max 100 chars) |
| `avatar` | String | | Profile picture URL |
| `permissions` | String[] | ✓ | Array of permission strings |
| `status` | String | ✓ | Account status |
| `isEmailVerified` | Boolean | ✓ | Email verification status |
| `twoFactorEnabled` | Boolean | ✓ | 2FA status |
| `lastLogin` | Date | | Last login timestamp |
| `lastLoginIp` | String | | Last login IP address |
| `loginAttempts` | Number | ✓ | Failed login count |
| `lockUntil` | Date | | Account lock expiry |
| `activityLog` | Array | | Admin activity history |
| `createdBy` | ObjectId | | Creating admin ID |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Activity Log Structure

```typescript
{
  action: string,
  timestamp: Date,
  ipAddress: string,
  details: string
}
```

### Permissions

Available permission strings:
- `users.read`, `users.write`, `users.delete`
- `donations.read`, `donations.write`, `donations.refund`
- `fraud.read`, `fraud.write`, `fraud.investigate`
- `reports.read`, `reports.generate`
- `settings.read`, `settings.write`
- `admins.read`, `admins.write`, `admins.delete`

### Indexes

- `username` (unique)
- `email` (unique)
- `username + email` (compound)
- `status + role` (compound)
- `createdAt` (descending)

### Enums

**AdminRole**: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SUPPORT`

---

## Donations Collection

The `donations` collection tracks all donation transactions.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `donorId` | ObjectId | ✓ | Reference to User |
| `streamerId` | ObjectId | ✓ | Reference to User |
| `amount` | Number | ✓ | Donation amount |
| `currency` | String | ✓ | Currency code (default: INR) |
| `status` | String | ✓ | Transaction status |
| `paymentMethod` | String | ✓ | Payment method used |
| `paymentGateway` | String | ✓ | Gateway provider |
| `transactionId` | String | ✓ | Unique transaction ID |
| `gatewayTransactionId` | String | | Gateway's transaction ID |
| `gatewayOrderId` | String | | Gateway's order ID |
| `message` | String | | Donor message (max 500 chars) |
| `isAnonymous` | Boolean | ✓ | Anonymous donation flag |
| `donorName` | String | | Display name for donation |
| `metadata` | Object | | Transaction metadata |
| `fees` | Object | ✓ | Fee breakdown |
| `netAmount` | Number | ✓ | Amount after fees |
| `alertShown` | Boolean | ✓ | Alert display status |
| `alertShownAt` | Date | | Alert display timestamp |
| `refund` | Object | | Refund information |
| `fraudCheck` | Object | | Fraud check results |
| `processedAt` | Date | | Processing timestamp |
| `completedAt` | Date | | Completion timestamp |
| `failedAt` | Date | | Failure timestamp |
| `failureReason` | String | | Failure reason |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Metadata Structure

```typescript
{
  upiId: string,
  cardLast4: string,
  bankName: string,
  walletProvider: string,
  ipAddress: string,
  userAgent: string,
  referer: string
}
```

### Fees Structure

```typescript
{
  gatewayFee: number,    // Gateway charges
  platformFee: number,   // Platform charges
  gst: number,           // Tax
  totalFee: number       // Sum of all fees
}
```

### Refund Structure

```typescript
{
  refundId: string,
  refundAmount: number,
  refundReason: string,
  refundedAt: Date,
  refundedBy: ObjectId  // Reference to Admin
}
```

### Fraud Check Structure

```typescript
{
  score: number,         // 0-100
  flagged: boolean,
  reason: string,
  checkedAt: Date
}
```

### Indexes

- `transactionId` (unique)
- `donorId + transactionId` (compound)
- `streamerId + status` (compound)
- `streamerId + completedAt` (compound, descending)
- `status + createdAt` (compound, descending)
- `fraudCheck.flagged`
- `amount` (descending)
- `createdAt` (descending)

### Enums

**DonationStatus**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`, `CANCELLED`

**PaymentMethod**: `UPI`, `QR_CODE`, `CARD`, `NET_BANKING`, `WALLET`, `AUTOPAY`

**PaymentGateway**: `RAZORPAY`, `PHONEPE`, `PAYTM`, `STRIPE`, `CASHFREE`

---

## FraudLogs Collection

The `fraudlogs` collection tracks fraud detection and investigation.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `entityType` | String | ✓ | Type of entity |
| `entityId` | Mixed | ✓ | Entity identifier |
| `userId` | ObjectId | | Reference to User |
| `donationId` | ObjectId | | Reference to Donation |
| `severity` | String | ✓ | Fraud severity level |
| `action` | String | ✓ | Action taken |
| `reason` | String | ✓ | Fraud reason (max 500 chars) |
| `description` | String | | Detailed description (max 2000 chars) |
| `riskScore` | Number | ✓ | Risk score (0-100) |
| `indicators` | Array | ✓ | Fraud indicators |
| `detection` | Object | ✓ | Detection details |
| `metadata` | Object | | Additional metadata |
| `investigation` | Object | | Investigation details |
| `resolution` | Object | | Resolution information |
| `relatedLogs` | ObjectId[] | | Related fraud logs |
| `isActive` | Boolean | ✓ | Active status |
| `expiresAt` | Date | | Expiration date |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Indicators Structure

```typescript
{
  type: string,          // Indicator type
  value: string,         // Indicator value
  weight: number         // Importance weight
}
```

### Detection Structure

```typescript
{
  method: 'AUTOMATED' | 'MANUAL' | 'REPORTED',
  detectedBy: ObjectId,          // Admin reference
  automatedRuleName: string
}
```

### Investigation Structure

```typescript
{
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED',
  assignedTo: ObjectId,          // Admin reference
  notes: [{
    note: string,
    addedBy: ObjectId,
    addedAt: Date
  }],
  startedAt: Date,
  completedAt: Date,
  outcome: string
}
```

### Resolution Structure

```typescript
{
  action: 'NO_ACTION' | 'WARNING' | 'SUSPENSION' | 'BAN' | 'LEGAL_ACTION',
  resolvedBy: ObjectId,          // Admin reference
  resolvedAt: Date,
  notes: string
}
```

### Indexes

- `entityType + entityId` (compound)
- `severity + isActive` (compound)
- `action + createdAt` (compound, descending)
- `investigation.status + investigation.assignedTo` (compound)
- `userId + createdAt` (compound, descending)
- `riskScore` (descending)
- `metadata.location.coordinates` (2dsphere)

### Enums

**EntityType**: `USER`, `DONATION`, `TRANSACTION`, `IP_ADDRESS`

**FraudSeverity**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**FraudAction**: `FLAGGED`, `BLOCKED`, `REVIEWED`, `CLEARED`, `BANNED`

---

## QRCodeOrders Collection

The `qrcodeorders` collection manages QR code generation and tracking.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `streamerId` | ObjectId | ✓ | Reference to User |
| `qrCodeId` | String | ✓ | Unique QR code identifier |
| `qrCodeUrl` | String | ✓ | QR code image URL |
| `qrCodeData` | String | ✓ | QR code encoded data |
| `upiId` | String | ✓ | UPI ID for payments |
| `merchantName` | String | ✓ | Merchant display name |
| `status` | String | ✓ | QR code status |
| `amount` | Number | | Fixed amount (if not dynamic) |
| `isDynamic` | Boolean | ✓ | Dynamic amount flag |
| `gateway` | String | ✓ | Payment gateway |
| `gatewayQRId` | String | | Gateway's QR ID |
| `validFrom` | Date | ✓ | Validity start date |
| `validUntil` | Date | | Validity end date |
| `usage` | Object | ✓ | Usage statistics |
| `restrictions` | Object | | Usage restrictions |
| `metadata` | Object | | Additional metadata |
| `deactivatedAt` | Date | | Deactivation timestamp |
| `deactivatedBy` | ObjectId | | Deactivating admin |
| `deactivationReason` | String | | Reason for deactivation |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Usage Statistics

```typescript
{
  totalScans: number,
  successfulPayments: number,
  totalAmountReceived: number,
  lastUsedAt: Date
}
```

### Restrictions

```typescript
{
  maxUsageCount: number,
  maxAmountPerTransaction: number,
  minAmountPerTransaction: number,
  allowedPaymentMethods: string[]
}
```

### Indexes

- `qrCodeId` (unique)
- `streamerId + status` (compound)
- `status + validUntil` (compound)
- `qrCodeId + streamerId` (compound)
- `createdAt` (descending)

### Enums

**QRCodeStatus**: `ACTIVE`, `INACTIVE`, `EXPIRED`, `REVOKED`

---

## AutopayMandates Collection

The `autopaymandates` collection manages recurring payment authorizations.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `donorId` | ObjectId | ✓ | Reference to User |
| `streamerId` | ObjectId | ✓ | Reference to User |
| `mandateId` | String | ✓ | Unique mandate identifier |
| `gatewayMandateId` | String | ✓ | Gateway's mandate ID |
| `status` | String | ✓ | Mandate status |
| `amount` | Number | ✓ | Payment amount |
| `currency` | String | ✓ | Currency code |
| `frequency` | String | ✓ | Payment frequency |
| `startDate` | Date | ✓ | Start date |
| `endDate` | Date | | End date |
| `nextExecutionDate` | Date | ✓ | Next payment date |
| `gateway` | String | ✓ | Payment gateway |
| `bankAccount` | Object | | Bank account details |
| `card` | Object | | Card details |
| `upi` | Object | | UPI details |
| `maxAmount` | Number | ✓ | Maximum amount limit |
| `executionHistory` | Array | ✓ | Payment execution history |
| `statistics` | Object | ✓ | Execution statistics |
| `pausedAt` | Date | | Pause timestamp |
| `pausedBy` | String | | Who paused |
| `pauseReason` | String | | Pause reason |
| `cancelledAt` | Date | | Cancellation timestamp |
| `cancelledBy` | String | | Who cancelled |
| `cancellationReason` | String | | Cancellation reason |
| `metadata` | Object | | Additional metadata |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Execution History

```typescript
{
  executedAt: Date,
  amount: number,
  status: 'SUCCESS' | 'FAILED' | 'PENDING',
  donationId: ObjectId,
  failureReason: string,
  transactionId: string
}
```

### Statistics

```typescript
{
  totalExecutions: number,
  successfulExecutions: number,
  failedExecutions: number,
  totalAmountCollected: number,
  lastExecutionDate: Date,
  lastSuccessfulExecutionDate: Date
}
```

### Indexes

- `mandateId` (unique)
- `donorId + streamerId` (compound)
- `status + nextExecutionDate` (compound)
- `streamerId + status` (compound)
- `mandateId + donorId` (compound)
- `createdAt` (descending)

### Enums

**AutopayStatus**: `ACTIVE`, `PAUSED`, `CANCELLED`, `EXPIRED`, `PENDING_APPROVAL`

**RecurringFrequency**: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

---

## RecurringPayments Collection

The `recurringpayments` collection tracks subscription and recurring payment schedules.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `donorId` | ObjectId | ✓ | Reference to User |
| `streamerId` | ObjectId | ✓ | Reference to User |
| `mandateId` | ObjectId | ✓ | Reference to AutopayMandate |
| `subscriptionId` | String | ✓ | Unique subscription identifier |
| `status` | String | ✓ | Subscription status |
| `amount` | Number | ✓ | Payment amount |
| `currency` | String | ✓ | Currency code |
| `frequency` | String | ✓ | Payment frequency |
| `startDate` | Date | ✓ | Start date |
| `endDate` | Date | | End date |
| `nextPaymentDate` | Date | ✓ | Next payment date |
| `lastPaymentDate` | Date | | Last payment date |
| `totalPaymentsScheduled` | Number | | Total scheduled payments |
| `completedPayments` | Number | ✓ | Completed payment count |
| `failedPayments` | Number | ✓ | Failed payment count |
| `payments` | Array | ✓ | Payment records |
| `statistics` | Object | ✓ | Payment statistics |
| `retryPolicy` | Object | ✓ | Retry configuration |
| `notifications` | Object | ✓ | Notification settings |
| `pausedAt` | Date | | Pause timestamp |
| `pausedBy` | String | | Who paused |
| `pauseReason` | String | | Pause reason |
| `resumedAt` | Date | | Resume timestamp |
| `cancelledAt` | Date | | Cancellation timestamp |
| `cancelledBy` | String | | Who cancelled |
| `cancellationReason` | String | | Cancellation reason |
| `metadata` | Object | | Additional metadata |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Payment Record

```typescript
{
  paymentId: ObjectId,
  scheduledAt: Date,
  processedAt: Date,
  amount: number,
  status: 'SCHEDULED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'SKIPPED',
  transactionId: string,
  failureReason: string,
  retryCount: number
}
```

### Statistics

```typescript
{
  totalAmountCollected: number,
  averagePaymentAmount: number,
  successRate: number,
  longestStreak: number,
  currentStreak: number
}
```

### Retry Policy

```typescript
{
  enabled: boolean,
  maxRetries: number,
  retryIntervalHours: number,
  lastRetryAt: Date
}
```

### Notifications

```typescript
{
  emailEnabled: boolean,
  smsEnabled: boolean,
  webhookEnabled: boolean,
  notifyOnSuccess: boolean,
  notifyOnFailure: boolean,
  notifyBeforePayment: boolean,
  notifyBeforeDays: number
}
```

### Indexes

- `subscriptionId` (unique)
- `donorId + streamerId` (compound)
- `status + nextPaymentDate` (compound)
- `streamerId + status` (compound)
- `subscriptionId + donorId` (compound)
- `payments.scheduledAt`
- `createdAt` (descending)

---

## PaymentHistories Collection

The `paymenthistories` collection maintains a complete audit trail of all payment transactions.

### Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | ✓ | Reference to User |
| `transactionType` | String | ✓ | Type of transaction |
| `donationId` | ObjectId | | Reference to Donation |
| `mandateId` | ObjectId | | Reference to AutopayMandate |
| `recurringPaymentId` | ObjectId | | Reference to RecurringPayment |
| `amount` | Number | ✓ | Transaction amount |
| `currency` | String | ✓ | Currency code |
| `paymentMethod` | String | ✓ | Payment method |
| `paymentGateway` | String | ✓ | Gateway provider |
| `transactionId` | String | ✓ | Unique transaction ID |
| `gatewayTransactionId` | String | | Gateway's transaction ID |
| `status` | String | ✓ | Transaction status |
| `description` | String | ✓ | Transaction description |
| `metadata` | Object | | Transaction metadata |
| `timeline` | Object | ✓ | Event timeline |
| `fees` | Object | ✓ | Fee breakdown |
| `netAmount` | Number | ✓ | Amount after fees |
| `failureDetails` | Object | | Failure information |
| `refundDetails` | Object | | Refund information |
| `notes` | String | | Additional notes |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Timeline

```typescript
{
  initiatedAt: Date,
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date
}
```

### Failure Details

```typescript
{
  code: string,
  message: string,
  retry: boolean,
  retryAttempts: number
}
```

### Indexes

- `transactionId` (unique)
- `userId + status` (compound)
- `userId + transactionType` (compound)
- `transactionId + userId` (compound)
- `status + createdAt` (compound, descending)
- `timeline.completedAt` (descending)
- `createdAt` (descending)

### Enums

**TransactionType**: `DONATION`, `REFUND`, `SUBSCRIPTION`, `TIP`, `MEMBERSHIP`

**Transaction Status**: `INITIATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`

---

## Data Relationships

```
User (Streamer) ─┬─→ Donations (receives)
                 ├─→ QRCodeOrders
                 ├─→ AutopayMandates (receives from)
                 └─→ RecurringPayments (receives from)

User (Donor) ────┬─→ Donations (makes)
                 ├─→ AutopayMandates (creates)
                 ├─→ RecurringPayments (creates)
                 └─→ PaymentHistory

Admin ───────────┬─→ FraudLogs (investigates)
                 ├─→ Donations (manages refunds)
                 └─→ QRCodeOrders (can deactivate)

Donation ────────┬─→ PaymentHistory
                 └─→ FraudLog

AutopayMandate ──→ RecurringPayment

RecurringPayment ─→ Donations (generates)
```

---

## Best Practices

### Querying

1. **Use Indexes**: Always filter on indexed fields for better performance
2. **Projection**: Select only needed fields to reduce data transfer
3. **Pagination**: Use skip/limit or cursor-based pagination for large datasets
4. **Population**: Use `populate()` wisely to avoid over-fetching

### Data Integrity

1. **Transactions**: Use MongoDB transactions for multi-document operations
2. **Validation**: Leverage Mongoose validators and middleware
3. **Soft Deletes**: Consider soft deletes for audit trail
4. **Archiving**: Archive old records to maintain performance

### Security

1. **Sensitive Data**: Use `select: false` for sensitive fields
2. **Password Hashing**: Always hash passwords before storing
3. **Input Validation**: Validate and sanitize all inputs
4. **Rate Limiting**: Implement rate limiting for sensitive operations

---

## Performance Optimization

### Index Strategy

- Create compound indexes for common query patterns
- Use sparse indexes for optional fields
- Monitor index usage with `explain()`
- Remove unused indexes

### Caching

- Cache frequently accessed, rarely changed data
- Use Redis for session and temporary data
- Implement cache invalidation strategies

### Query Optimization

- Use aggregation pipelines for complex queries
- Limit array sizes in documents
- Avoid unbounded array growth
- Use batch operations where possible

---

**Last Updated**: December 2024
