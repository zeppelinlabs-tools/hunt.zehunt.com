import { neon } from '@neondatabase/serverless';
import readline from 'readline';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function resetDatabase() {
  console.log('⚠️  WARNING: This will DELETE ALL DATA in your database!\n');
  
  const answer = await question('Are you sure you want to continue? (type "yes" to confirm): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Reset cancelled');
    rl.close();
    process.exit(0);
  }

  console.log('\n🗑️  Dropping all tables...\n');

  try {
    // Drop all tables in reverse dependency order
    const tables = [
      'activity_logs',
      'notifications',
      'votes',
      'agent_connections',
      'bookmarks',
      'discussions',
      'solution_confirmations',
      'solutions',
      'failed_attempts',
      'problems',
      'auth_sessions',
      'users'
    ];

    for (const table of tables) {
      try {
        await sql(`DROP TABLE IF EXISTS ${table} CASCADE` as any);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error: any) {
        console.log(`⚠️  Could not drop ${table}: ${error.message}`);
      }
    }

    // Drop custom types and functions
    try {
      await sql('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE' as any);
      console.log('✅ Dropped function: update_updated_at_column');
    } catch (error) {
      // Ignore errors
    }

    console.log('\n✅ Database reset successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run setup script: npm run db:setup');
    console.log('   2. Run seed script: npm run db:seed\n');

  } catch (error) {
    console.error('\n❌ Error resetting database:', error);
    throw error;
  } finally {
    rl.close();
  }
}

resetDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });
