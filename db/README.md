# Database Setup

This directory contains the database schema and migration scripts for the Hunt platform.

## Prerequisites

- Neon PostgreSQL account (https://neon.tech)
- Node.js 18+ installed
- npm or yarn package manager

## Quick Start

### 1. Create Neon Database

1. Go to https://neon.tech and create a new project
2. Note your connection string (it should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname`)

### 2. Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Neon database URL to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 3. Run Database Schema

You can run the schema using one of these methods:

#### Option A: Using Neon SQL Editor (Recommended)

1. Go to your Neon project dashboard
2. Click on "SQL Editor"
3. Copy the contents of `db/schema.sql`
4. Paste and run the SQL

#### Option B: Using psql Command Line

```bash
psql "$DATABASE_URL" < db/schema.sql
```

#### Option C: Using Node.js Script

Create a file `scripts/setup-db.ts`:

```typescript
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

async function setupDatabase() {
  const schema = fs.readFileSync(
    path.join(process.cwd(), 'db', 'schema.sql'),
    'utf-8'
  );

  await sql(schema);
  console.log('✅ Database schema created successfully!');
}

setupDatabase().catch(console.error);
```

Run it:
```bash
npx tsx scripts/setup-db.ts
```

### 4. Seed Initial Data (Optional)

Create admin user and sample data:

```bash
npx tsx scripts/seed.ts
```

## Database Structure

### Core Tables

- **users** - User accounts with authentication
- **auth_sessions** - Active authentication sessions
- **problems** - Problem reports with context and symptoms
- **failed_attempts** - Documented failed solution attempts
- **solutions** - Proposed and verified solutions
- **solution_confirmations** - Community verifications
- **discussions** - Comments and discussions
- **bookmarks** - Saved problems per user

### MCP Integration Tables

- **agent_connections** - AI agent API keys and permissions
- **activity_logs** - Audit trail for all actions

### Utility Tables

- **votes** - Helpful/not helpful votes
- **notifications** - User notifications

## Indexes

The schema includes optimized indexes for:
- Authentication lookups (email, username, tokens)
- Problem search (tags, status, full-text)
- User activity queries
- MCP API key validation

## Schema Migrations

For future schema changes, we recommend using a migration tool:

### Option A: Drizzle ORM
```bash
npm install drizzle-orm drizzle-kit
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Option B: Prisma
```bash
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev
```

## Backup and Restore

### Backup
```bash
pg_dump "$DATABASE_URL" > backup.sql
```

### Restore
```bash
psql "$DATABASE_URL" < backup.sql
```

## Performance Tuning

Neon automatically handles:
- Connection pooling
- Query optimization
- Automatic scaling

For production, consider:
- Enabling branching for dev/staging environments
- Setting up read replicas for read-heavy workloads
- Monitoring query performance in Neon dashboard

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check your DATABASE_URL is correct
2. Ensure `?sslmode=require` is in the connection string
3. Verify your IP is allowed (Neon allows all IPs by default)

### Schema Already Exists

If tables already exist:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then run the schema again.

### Performance Issues

Check slow queries in Neon dashboard:
1. Go to your project
2. Click "Monitoring"
3. Check "Slow Queries" tab

## Security Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Use different databases** for dev/staging/production
3. **Rotate API keys** regularly in `agent_connections`
4. **Monitor activity_logs** for suspicious activity
5. **Enable Neon IP allowlist** in production

## Support

- Neon Documentation: https://neon.tech/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Hunt Platform Issues: https://github.com/zeppelinlabs-tools/hunt.zehunt.com/issues
