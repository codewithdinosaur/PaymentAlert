import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import Admin from '../models/Admin';
import { AdminRole, AccountStatus } from '../utils/enums';

dotenv.config();

const seedAdminData = [
  {
    username: process.env.ADMIN_USERNAME || 'superadmin',
    email: process.env.ADMIN_EMAIL || 'admin@paymentalert.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: AdminRole.SUPER_ADMIN,
    fullName: 'Super Administrator',
    permissions: [
      'users.read',
      'users.write',
      'users.delete',
      'donations.read',
      'donations.write',
      'donations.refund',
      'fraud.read',
      'fraud.write',
      'fraud.investigate',
      'reports.read',
      'reports.generate',
      'settings.read',
      'settings.write',
      'admins.read',
      'admins.write',
      'admins.delete',
    ],
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    twoFactorEnabled: false,
  },
  {
    username: 'admin',
    email: 'admin2@paymentalert.com',
    password: 'Admin@123456',
    role: AdminRole.ADMIN,
    fullName: 'Administrator',
    permissions: [
      'users.read',
      'users.write',
      'donations.read',
      'donations.write',
      'donations.refund',
      'fraud.read',
      'fraud.write',
      'reports.read',
      'reports.generate',
    ],
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    twoFactorEnabled: false,
  },
  {
    username: 'moderator',
    email: 'moderator@paymentalert.com',
    password: 'Moderator@123456',
    role: AdminRole.MODERATOR,
    fullName: 'Content Moderator',
    permissions: [
      'users.read',
      'donations.read',
      'fraud.read',
      'fraud.investigate',
      'reports.read',
    ],
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    twoFactorEnabled: false,
  },
  {
    username: 'support',
    email: 'support@paymentalert.com',
    password: 'Support@123456',
    role: AdminRole.SUPPORT,
    fullName: 'Support Agent',
    permissions: [
      'users.read',
      'donations.read',
      'reports.read',
    ],
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    twoFactorEnabled: false,
  },
];

async function seedAdmins() {
  try {
    await connectDatabase();

    console.log('🌱 Starting admin seed...');

    const existingAdminCount = await Admin.countDocuments();
    
    if (existingAdminCount > 0) {
      console.log('⚠️  Admins already exist in the database.');
      console.log('   Do you want to clear existing admins and reseed? (This is a destructive operation)');
      console.log('   To proceed, set FORCE_SEED=true in your environment variables.');
      
      if (process.env.FORCE_SEED !== 'true') {
        console.log('   Skipping seed. Exiting...');
        await disconnectDatabase();
        return;
      }

      console.log('   Clearing existing admins...');
      await Admin.deleteMany({});
    }

    console.log('   Creating admin accounts...');
    
    for (const adminData of seedAdminData) {
      const admin = new Admin(adminData);
      await admin.save();
      console.log(`   ✅ Created ${adminData.role}: ${adminData.username} (${adminData.email})`);
    }

    console.log('\n✅ Admin seed completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('==========================================');
    seedAdminData.forEach((admin) => {
      console.log(`   Role: ${admin.role}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log('------------------------------------------');
    });
    console.log('\n⚠️  IMPORTANT: Change these passwords in production!');

    await disconnectDatabase();
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

if (require.main === module) {
  seedAdmins();
}

export default seedAdmins;
