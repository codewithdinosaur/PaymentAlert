import seedAdmins from './adminSeed';
import seedSampleData from './sampleDataSeed';

async function seedAll() {
  console.log('🌱 Starting complete database seed...\n');
  
  try {
    await seedAdmins();
    
    console.log('\n');
    
    if (process.env.SEED_SAMPLE_DATA === 'true') {
      await seedSampleData();
    } else {
      console.log('ℹ️  Skipping sample data seed.');
      console.log('   To include sample data, set SEED_SAMPLE_DATA=true in your environment variables.');
    }
    
    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedAll();
}

export default seedAll;
