export enum UserRole {
  STREAMER = 'STREAMER',
  DONOR = 'DONOR',
  BOTH = 'BOTH',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
}

export enum DonationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  UPI = 'UPI',
  QR_CODE = 'QR_CODE',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  AUTOPAY = 'AUTOPAY',
}

export enum PaymentGateway {
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
  PAYTM = 'PAYTM',
  STRIPE = 'STRIPE',
  CASHFREE = 'CASHFREE',
}

export enum QRCodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum AutopayStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum FraudSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudAction {
  FLAGGED = 'FLAGGED',
  BLOCKED = 'BLOCKED',
  REVIEWED = 'REVIEWED',
  CLEARED = 'CLEARED',
  BANNED = 'BANNED',
}

export enum TierLevel {
  FREE = 'FREE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum TransactionType {
  DONATION = 'DONATION',
  REFUND = 'REFUND',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TIP = 'TIP',
  MEMBERSHIP = 'MEMBERSHIP',
}
