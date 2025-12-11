import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

dotenv.config();

async function startApplication() {
  try {
    await connectDatabase();
    
    console.log('\n🚀 PaymentAlert Application Started');
    console.log('====================================');
    console.log('✅ Database connection established');
    console.log('\n📋 Available Models:');
    console.log('   - User (Streamers & Donors)');
    console.log('   - Admin');
    console.log('   - Donation');
    console.log('   - FraudLog');
    console.log('   - QRCodeOrder');
    console.log('   - AutopayMandate');
    console.log('   - PaymentHistory');
    console.log('   - RecurringPayment');
    console.log('\n💡 Ready to accept connections');
    console.log('====================================\n');

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

startApplication();
