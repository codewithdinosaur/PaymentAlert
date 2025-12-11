import { connectDatabase, disconnectDatabase } from '../src/config/database';
import {
  User,
  Admin,
  Donation,
  FraudLog,
  QRCodeOrder,
  AutopayMandate,
  RecurringPayment,
  PaymentHistory,
} from '../src/models';
import {
  UserRole,
  AdminRole,
  DonationStatus,
  PaymentMethod,
  PaymentGateway,
  AccountStatus,
  TierLevel,
  QRCodeStatus,
  AutopayStatus,
  RecurringFrequency,
  FraudSeverity,
  FraudAction,
  TransactionType,
} from '../src/utils/enums';

async function exampleUsage() {
  await connectDatabase();

  console.log('📚 PaymentAlert Usage Examples\n');

  console.log('1️⃣  Creating a Streamer User');
  const streamer = new User({
    username: 'example_streamer',
    email: 'streamer@example.com',
    password: 'SecurePassword123!',
    role: UserRole.STREAMER,
    displayName: 'Example Streamer',
    bio: 'Professional content creator',
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    streamerProfile: {
      streamingPlatforms: [
        {
          platform: 'Twitch',
          profileUrl: 'https://twitch.tv/example_streamer',
          verified: true,
        },
      ],
      paymentSettings: {
        upiId: 'streamer@upi',
        qrCodeEnabled: true,
        minDonationAmount: 10,
        maxDonationAmount: 100000,
        allowAnonymous: true,
        showDonorList: true,
      },
      alertSettings: {
        soundEnabled: true,
        minAmountForAlert: 50,
        displayDuration: 5,
        customMessage: 'Thanks for your support!',
      },
      tier: {
        level: TierLevel.GOLD,
        features: ['custom_alerts', 'donation_goals', 'analytics', 'webhooks'],
      },
      stats: {
        totalDonationsReceived: 0,
        totalAmountReceived: 0,
        totalDonors: 0,
        averageDonation: 0,
      },
    },
  });

  console.log('✅ Streamer object created (not yet saved)\n');

  console.log('2️⃣  Creating a Donor User');
  const donor = new User({
    username: 'example_donor',
    email: 'donor@example.com',
    password: 'SecurePassword456!',
    role: UserRole.DONOR,
    displayName: 'Example Donor',
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    donorProfile: {
      totalDonationsGiven: 0,
      totalAmountGiven: 0,
      favoriteStreamers: [],
      preferredPaymentMethod: PaymentMethod.UPI,
    },
  });

  console.log('✅ Donor object created (not yet saved)\n');

  console.log('3️⃣  Creating a Donation');
  const donation = new Donation({
    donorId: donor._id,
    streamerId: streamer._id,
    amount: 500,
    currency: 'INR',
    status: DonationStatus.PENDING,
    paymentMethod: PaymentMethod.UPI,
    paymentGateway: PaymentGateway.RAZORPAY,
    transactionId: `TXN${Date.now()}`,
    gatewayTransactionId: `RAZORPAY_${Date.now()}`,
    message: 'Great stream! Keep up the awesome content!',
    isAnonymous: false,
    donorName: donor.displayName,
    metadata: {
      upiId: 'donor@upi',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    },
    fees: {
      gatewayFee: 10,
      platformFee: 25,
      gst: 9,
      totalFee: 44,
    },
    netAmount: 456,
    alertShown: false,
  });

  console.log('✅ Donation object created\n');

  console.log('4️⃣  Creating a QR Code Order');
  const qrCode = new QRCodeOrder({
    streamerId: streamer._id,
    qrCodeId: `QR${Date.now()}`,
    qrCodeUrl: `https://paymentalert.com/qr/${streamer.username}`,
    qrCodeData: `upi://pay?pa=streamer@upi&pn=${streamer.displayName}`,
    upiId: 'streamer@upi',
    merchantName: streamer.displayName,
    status: QRCodeStatus.ACTIVE,
    isDynamic: true,
    gateway: PaymentGateway.RAZORPAY,
    validFrom: new Date(),
    usage: {
      totalScans: 0,
      successfulPayments: 0,
      totalAmountReceived: 0,
    },
  });

  console.log('✅ QR Code object created\n');

  console.log('5️⃣  Creating an Autopay Mandate');
  const mandate = new AutopayMandate({
    donorId: donor._id,
    streamerId: streamer._id,
    mandateId: `MANDATE${Date.now()}`,
    gatewayMandateId: `RAZORPAY_MANDATE_${Date.now()}`,
    status: AutopayStatus.ACTIVE,
    amount: 1000,
    currency: 'INR',
    frequency: RecurringFrequency.MONTHLY,
    startDate: new Date(),
    nextExecutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    gateway: PaymentGateway.RAZORPAY,
    upi: {
      vpa: 'donor@upi',
    },
    maxAmount: 2000,
    executionHistory: [],
    statistics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalAmountCollected: 0,
    },
  });

  console.log('✅ Autopay Mandate object created\n');

  console.log('6️⃣  Creating a Recurring Payment');
  const recurringPayment = new RecurringPayment({
    donorId: donor._id,
    streamerId: streamer._id,
    mandateId: mandate._id,
    subscriptionId: `SUB${Date.now()}`,
    status: AutopayStatus.ACTIVE,
    amount: 1000,
    currency: 'INR',
    frequency: RecurringFrequency.MONTHLY,
    startDate: new Date(),
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completedPayments: 0,
    failedPayments: 0,
    payments: [],
    statistics: {
      totalAmountCollected: 0,
      averagePaymentAmount: 1000,
      successRate: 0,
      longestStreak: 0,
      currentStreak: 0,
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      retryIntervalHours: 24,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      webhookEnabled: false,
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notifyBeforePayment: true,
      notifyBeforeDays: 2,
    },
  });

  console.log('✅ Recurring Payment object created\n');

  console.log('7️⃣  Creating a Fraud Log');
  const fraudLog = new FraudLog({
    entityType: 'DONATION',
    entityId: donation._id,
    userId: donor._id,
    donationId: donation._id,
    severity: FraudSeverity.MEDIUM,
    action: FraudAction.FLAGGED,
    reason: 'Multiple rapid transactions from same IP',
    riskScore: 65,
    indicators: [
      {
        type: 'rapid_transactions',
        value: '5 transactions in 2 minutes',
        weight: 0.7,
      },
      {
        type: 'new_account',
        value: 'Account created less than 1 hour ago',
        weight: 0.3,
      },
    ],
    detection: {
      method: 'AUTOMATED',
      automatedRuleName: 'rapid_transaction_detection',
    },
    metadata: {
      ipAddress: '192.168.1.1',
      previousViolations: 0,
    },
    investigation: {
      status: 'PENDING',
      notes: [],
    },
    isActive: true,
  });

  console.log('✅ Fraud Log object created\n');

  console.log('8️⃣  Creating Payment History');
  const paymentHistory = new PaymentHistory({
    userId: donor._id,
    transactionType: TransactionType.DONATION,
    donationId: donation._id,
    amount: 500,
    currency: 'INR',
    paymentMethod: PaymentMethod.UPI,
    paymentGateway: PaymentGateway.RAZORPAY,
    transactionId: donation.transactionId,
    gatewayTransactionId: donation.gatewayTransactionId,
    status: 'SUCCESS',
    description: `Donation to ${streamer.displayName}`,
    timeline: {
      initiatedAt: new Date(Date.now() - 60000),
      processedAt: new Date(Date.now() - 30000),
      completedAt: new Date(),
    },
    fees: donation.fees,
    netAmount: donation.netAmount,
  });

  console.log('✅ Payment History object created\n');

  console.log('\n📖 Query Examples\n');

  console.log('Example 1: Find all streamers with GOLD tier or higher');
  console.log(`
  const goldStreamers = await User.find({
    role: UserRole.STREAMER,
    'streamerProfile.tier.level': { $in: [TierLevel.GOLD, TierLevel.PLATINUM, TierLevel.DIAMOND] }
  });
  `);

  console.log('Example 2: Get recent donations for a streamer');
  console.log(`
  const recentDonations = await Donation.find({
    streamerId: streamerId,
    status: DonationStatus.COMPLETED
  })
    .populate('donorId', 'displayName username')
    .sort({ completedAt: -1 })
    .limit(10);
  `);

  console.log('Example 3: Calculate total donations received by streamer');
  console.log(`
  const stats = await Donation.aggregate([
    {
      $match: {
        streamerId: streamerId,
        status: DonationStatus.COMPLETED
      }
    },
    {
      $group: {
        _id: '$streamerId',
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgDonation: { $avg: '$amount' }
      }
    }
  ]);
  `);

  console.log('Example 4: Find active autopay mandates due for execution');
  console.log(`
  const dueForExecution = await AutopayMandate.find({
    status: AutopayStatus.ACTIVE,
    nextExecutionDate: { $lte: new Date() }
  })
    .populate('donorId streamerId')
    .sort({ nextExecutionDate: 1 });
  `);

  console.log('Example 5: Get high-severity fraud cases pending investigation');
  console.log(`
  const criticalFraud = await FraudLog.find({
    severity: { $in: [FraudSeverity.HIGH, FraudSeverity.CRITICAL] },
    'investigation.status': 'PENDING',
    isActive: true
  })
    .populate('userId', 'username email')
    .sort({ riskScore: -1, createdAt: -1 });
  `);

  console.log('Example 6: Update user password');
  console.log(`
  // Password will be automatically hashed by pre-save hook
  user.password = 'NewSecurePassword123!';
  await user.save();
  `);

  console.log('Example 7: Verify user password');
  console.log(`
  const isValid = await user.comparePassword('password123');
  if (isValid) {
    console.log('Password is correct');
  }
  `);

  console.log('\n✨ Examples completed!\n');

  await disconnectDatabase();
}

if (require.main === module) {
  exampleUsage().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export default exampleUsage;
