import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Create .env.local and add your Neon database URL');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log('🔧 Setting up database schema...\n');

  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by statements (basic split on semicolons outside quotes)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.length === 0) continue;

      try {
        await sql(statement as any);
        
        // Log progress for major operations
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE.*?(\w+)/i);
          if (match) {
            console.log(`✅ Created table: ${match[1]}`);
          }
        } else if (statement.includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX.*?(\w+)/i);
          if (match) {
            console.log(`✅ Created index: ${match[1]}`);
          }
        } else if (statement.includes('CREATE EXTENSION')) {
          const match = statement.match(/CREATE EXTENSION.*?"(\w+)"/i);
          if (match) {
            console.log(`✅ Enabled extension: ${match[1]}`);
          }
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          continue;
        }
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }

    console.log('\n✅ Database schema created successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run seed script: npm run db:seed');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Access API at: http://localhost:3000/api/v1\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
    throw error;
  }
}

setupDatabase()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
