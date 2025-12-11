import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Donation, QRCodeOrder, AutopayMandate, RecurringPayment, PaymentHistory } from '../models';
import {
  UserRole,
  AccountStatus,
  TierLevel,
  DonationStatus,
  PaymentMethod,
  PaymentGateway,
  QRCodeStatus,
  AutopayStatus,
  RecurringFrequency,
  TransactionType,
} from '../utils/enums';

dotenv.config();

async function seedSampleData() {
  try {
    await connectDatabase();

    console.log('🌱 Starting sample data seed...');

    const streamers = [];
    for (let i = 1; i <= 3; i++) {
      const streamer = new User({
        username: `streamer${i}`,
        email: `streamer${i}@example.com`,
        password: 'Streamer@123456',
        role: UserRole.STREAMER,
        displayName: `Streamer ${i}`,
        bio: `Professional streamer #${i}`,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        streamerProfile: {
          streamingPlatforms: [
            {
              platform: 'Twitch',
              profileUrl: `https://twitch.tv/streamer${i}`,
              verified: true,
            },
            {
              platform: 'YouTube',
              profileUrl: `https://youtube.com/@streamer${i}`,
              verified: true,
            },
          ],
          paymentSettings: {
            upiId: `streamer${i}@upi`,
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
            customMessage: 'Thank you for your support!',
          },
          tier: {
            level: i === 1 ? TierLevel.PLATINUM : i === 2 ? TierLevel.GOLD : TierLevel.SILVER,
            features: ['custom_alerts', 'donation_goals', 'analytics'],
          },
          stats: {
            totalDonationsReceived: 0,
            totalAmountReceived: 0,
            totalDonors: 0,
            averageDonation: 0,
          },
        },
      });
      await streamer.save();
      streamers.push(streamer);
      console.log(`   ✅ Created streamer: ${streamer.username}`);
    }

    const donors = [];
    for (let i = 1; i <= 5; i++) {
      const donor = new User({
        username: `donor${i}`,
        email: `donor${i}@example.com`,
        password: 'Donor@123456',
        role: UserRole.DONOR,
        displayName: `Donor ${i}`,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        donorProfile: {
          totalDonationsGiven: 0,
          totalAmountGiven: 0,
          favoriteStreamers: [streamers[0]._id],
          preferredPaymentMethod: PaymentMethod.UPI,
        },
      });
      await donor.save();
      donors.push(donor);
      console.log(`   ✅ Created donor: ${donor.username}`);
    }

    console.log('\n   Creating sample donations...');
    const donations = [];
    const amounts = [100, 250, 500, 1000, 2500];
    
    for (let i = 0; i < 10; i++) {
      const donor = donors[i % donors.length];
      const streamer = streamers[i % streamers.length];
      const amount = amounts[i % amounts.length];
      
      const donation = new Donation({
        donorId: donor._id,
        streamerId: streamer._id,
        amount,
        currency: 'INR',
        status: i < 8 ? DonationStatus.COMPLETED : DonationStatus.PENDING,
        paymentMethod: PaymentMethod.UPI,
        paymentGateway: PaymentGateway.RAZORPAY,
        transactionId: `TXN${Date.now()}${i}`,
        gatewayTransactionId: `RAZORPAY_${Date.now()}${i}`,
        message: i % 2 === 0 ? `Great stream! Keep it up!` : undefined,
        isAnonymous: i % 3 === 0,
        donorName: i % 3 === 0 ? undefined : donor.displayName,
        metadata: {
          upiId: `donor${i + 1}@upi`,
          ipAddress: '192.168.1.1',
        },
        fees: {
          gatewayFee: amount * 0.02,
          platformFee: amount * 0.05,
          gst: amount * 0.018,
          totalFee: amount * 0.088,
        },
        netAmount: amount * 0.912,
        alertShown: i < 8,
        alertShownAt: i < 8 ? new Date() : undefined,
        completedAt: i < 8 ? new Date() : undefined,
      });
      await donation.save();
      donations.push(donation);
    }
    console.log(`   ✅ Created ${donations.length} donations`);

    console.log('\n   Creating QR code orders...');
    for (let i = 0; i < streamers.length; i++) {
      const upiId = streamers[i].streamerProfile?.paymentSettings?.upiId || `streamer${i + 1}@upi`;
      const qrCode = new QRCodeOrder({
        streamerId: streamers[i]._id,
        qrCodeId: `QR${Date.now()}${i}`,
        qrCodeUrl: `https://paymentalert.com/qr/${streamers[i].username}`,
        qrCodeData: `upi://pay?pa=${upiId}&pn=${streamers[i].displayName}`,
        upiId,
        merchantName: streamers[i].displayName,
        status: QRCodeStatus.ACTIVE,
        isDynamic: true,
        gateway: PaymentGateway.RAZORPAY,
        validFrom: new Date(),
        usage: {
          totalScans: Math.floor(Math.random() * 100),
          successfulPayments: Math.floor(Math.random() * 50),
          totalAmountReceived: Math.floor(Math.random() * 10000),
        },
      });
      await qrCode.save();
      console.log(`   ✅ Created QR code for: ${streamers[i].username}`);
    }

    console.log('\n   Creating autopay mandates...');
    for (let i = 0; i < 2; i++) {
      const mandate = new AutopayMandate({
        donorId: donors[i]._id,
        streamerId: streamers[0]._id,
        mandateId: `MANDATE${Date.now()}${i}`,
        gatewayMandateId: `RAZORPAY_MANDATE_${Date.now()}${i}`,
        status: AutopayStatus.ACTIVE,
        amount: 500,
        currency: 'INR',
        frequency: RecurringFrequency.MONTHLY,
        startDate: new Date(),
        nextExecutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gateway: PaymentGateway.RAZORPAY,
        upi: {
          vpa: `donor${i + 1}@upi`,
        },
        maxAmount: 1000,
        executionHistory: [],
        statistics: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          totalAmountCollected: 0,
        },
      });
      await mandate.save();
      console.log(`   ✅ Created autopay mandate for donor${i + 1}`);

      const recurringPayment = new RecurringPayment({
        donorId: donors[i]._id,
        streamerId: streamers[0]._id,
        mandateId: mandate._id,
        subscriptionId: `SUB${Date.now()}${i}`,
        status: AutopayStatus.ACTIVE,
        amount: 500,
        currency: 'INR',
        frequency: RecurringFrequency.MONTHLY,
        startDate: new Date(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        completedPayments: 0,
        failedPayments: 0,
        payments: [],
        statistics: {
          totalAmountCollected: 0,
          averagePaymentAmount: 500,
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
      await recurringPayment.save();
      console.log(`   ✅ Created recurring payment for donor${i + 1}`);
    }

    console.log('\n   Creating payment history...');
    for (let i = 0; i < donations.length; i++) {
      if (donations[i].status === DonationStatus.COMPLETED) {
        const paymentHistory = new PaymentHistory({
          userId: donations[i].donorId,
          transactionType: TransactionType.DONATION,
          donationId: donations[i]._id,
          amount: donations[i].amount,
          currency: 'INR',
          paymentMethod: PaymentMethod.UPI,
          paymentGateway: PaymentGateway.RAZORPAY,
          transactionId: donations[i].transactionId,
          gatewayTransactionId: donations[i].gatewayTransactionId,
          status: 'SUCCESS',
          description: `Donation to ${streamers[i % streamers.length].displayName}`,
          timeline: {
            initiatedAt: new Date(Date.now() - 60000),
            processedAt: new Date(Date.now() - 30000),
            completedAt: new Date(),
          },
          fees: donations[i].fees,
          netAmount: donations[i].netAmount,
        });
        await paymentHistory.save();
      }
    }
    console.log(`   ✅ Created payment history records`);

    console.log('\n✅ Sample data seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Streamers: ${streamers.length}`);
    console.log(`   - Donors: ${donors.length}`);
    console.log(`   - Donations: ${donations.length}`);
    console.log(`   - QR Codes: ${streamers.length}`);
    console.log(`   - Autopay Mandates: 2`);
    console.log(`   - Recurring Payments: 2`);
    console.log(`   - Payment History: ${donations.filter(d => d.status === DonationStatus.COMPLETED).length}`);

    await disconnectDatabase();
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

if (require.main === module) {
  seedSampleData();
}

export default seedSampleData;
