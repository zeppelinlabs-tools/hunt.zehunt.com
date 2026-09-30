# Hunt Platform - Complete Backend Setup Guide

This guide walks you through setting up the complete backend for the Hunt platform, including database, authentication, API routes, and MCP integration.

## Architecture Overview

The Hunt platform uses:
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Native SQL with `@neondatabase/serverless`
- **Authentication**: JWT-based sessions with HTTP-only cookies
- **API**: RESTful endpoints under `/api/v1/*`
- **MCP Protocol**: HTTP endpoint at `/api/v1/mcp`
- **Rate Limiting**: Per-API-key daily limits
- **Storage**: PostgreSQL with JSON fields for flexible data

## Prerequisites

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Neon PostgreSQL** account (https://neon.tech)
4. **Git** for version control

## Step 1: Environment Setup

### 1.1 Create Neon Database

1. Go to https://neon.tech
2. Sign up or log in
3. Click "Create Project"
4. Choose a name (e.g., "hunt-production")
5. Select region closest to your users
6. Copy the connection string

### 1.2 Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your values:

```env
# Required
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Install Dependencies

```bash
npm install
```

Key backend packages installed:
- `@neondatabase/serverless` - Neon PostgreSQL client
- `bcrypt` - Password hashing
- `@types/bcrypt` - TypeScript types

## Step 3: Database Setup

### 3.1 Run Schema

**Option A: Using Neon SQL Editor (Recommended)**

1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Copy contents of `db/schema.sql`
4. Paste and execute

**Option B: Using Command Line**

```bash
psql "$DATABASE_URL" < db/schema.sql
```

**Option C: Using Node Script**

```bash
npx tsx scripts/setup-db.ts
```

### 3.2 Seed Initial Data

```bash
npx tsx scripts/seed.ts
```

This creates:
- Admin user (`admin@hunt.zehunt.com` / `admin123`)
- Developer user (`madnan@zehunt.com` / `dev123`)
- Sample verified problem with solution
- MCP API key for testing

**Important**: Save the MCP API key shown in the output!

## Step 4: Start Development Server

```bash
npm run dev
```

Server runs at: http://localhost:3000

## Step 5: Test API Endpoints

### 5.1 Authentication

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "display_name": "Test User",
    "password": "SecurePass123!"
  }'
```

**Sign In:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "madnan@zehunt.com",
    "password": "dev123"
  }'
```

Response includes `token` - save it for authenticated requests.

**Get Current User:**
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.2 Problems API

**List Problems:**
```bash
curl "http://localhost:3000/api/v1/problems?q=supabase&limit=10"
```

**Get Problem Details:**
```bash
curl http://localhost:3000/api/v1/problems/PROBLEM_ID
```

**Create Problem (Authenticated):**
```bash
curl -X POST http://localhost:3000/api/v1/problems \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Next.js build fails on Vercel with module not found",
    "context": "Deploying Next.js 15 app to Vercel production",
    "environment": {
      "next": "15.0.0",
      "node": "20.11.0",
      "deployment": "Vercel"
    },
    "error_message": "Module not found: Can'\''t resolve '\''@/lib/utils'\''",
    "symptoms": [
      "Build succeeds locally",
      "Fails on Vercel with module resolution error"
    ],
    "tags": ["Next.js", "Vercel", "Build Error"]
  }'
```

### 5.3 MCP Protocol

**List Available Tools:**
```bash
curl -X POST http://localhost:3000/api/v1/mcp \
  -H "X-Hunt-API-Key: YOUR_MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list"
  }'
```

**Search Problems:**
```bash
curl -X POST http://localhost:3000/api/v1/mcp \
  -H "X-Hunt-API-Key: YOUR_MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "search_problems",
      "arguments": {
        "query": "authentication fails",
        "tags": ["Next.js", "Supabase"],
        "limit": 5
      }
    }
  }'
```

## Step 6: MCP Integration with AI Agents

### 6.1 Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "hunt": {
      "command": "node",
      "args": ["-e", "console.log(JSON.stringify({endpoint: 'http://localhost:3000/api/v1/mcp', headers: {'X-Hunt-API-Key': 'YOUR_API_KEY'}}))"],
      "type": "http"
    }
  }
}
```

### 6.2 Cursor IDE

Add to `.cursor/mcp.json`:

```json
{
  "hunt": {
    "endpoint": "http://localhost:3000/api/v1/mcp",
    "headers": {
      "X-Hunt-API-Key": "YOUR_MCP_API_KEY"
    }
  }
}
```

### 6.3 Kiro IDE

Add to `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "hunt": {
      "type": "http",
      "endpoint": "http://localhost:3000/api/v1/mcp",
      "headers": {
        "X-Hunt-API-Key": "YOUR_MCP_API_KEY"
      }
    }
  }
}
```

## Step 7: Production Deployment

### 7.1 Vercel Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Complete backend implementation"
git push origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard

3. **Required Environment Variables:**
   - `DATABASE_URL` - Your Neon connection string
   - `JWT_SECRET` - Your JWT secret
   - `SESSION_SECRET` - Your session secret
   - `NEXT_PUBLIC_APP_URL` - Your production URL

4. **Deploy:**
   - Vercel automatically deploys on push

### 7.2 Post-Deployment

1. **Run seed script on production:**
```bash
DATABASE_URL="your-production-url" npx tsx scripts/seed.ts
```

2. **Test production API:**
```bash
curl https://hunt.zehunt.com/api/v1/problems
```

3. **Update MCP configs** with production URL

## Monitoring and Maintenance

### Database Monitoring

1. **Neon Dashboard:**
   - Monitor queries
   - Check connection usage
   - View slow queries

2. **Activity Logs:**
```sql
SELECT * FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 100;
```

### Rate Limiting

Check API usage:
```sql
SELECT 
  agent_name,
  requests_count,
  rate_limit_per_day,
  last_used_at
FROM agent_connections
WHERE status = 'active'
ORDER BY requests_count DESC;
```

### User Statistics

```sql
SELECT 
  u.username,
  COUNT(DISTINCT p.id) as problems_count,
  COUNT(DISTINCT s.id) as solutions_count
FROM users u
LEFT JOIN problems p ON p.author_id = u.id
LEFT JOIN solutions s ON s.author_id = u.id
WHERE u.status = 'active'
GROUP BY u.id, u.username
ORDER BY problems_count DESC;
```

## Troubleshooting

### Connection Errors

**Error**: `ECONNREFUSED` or `ETIMEDOUT`

**Solutions**:
1. Check DATABASE_URL is correct
2. Ensure `?sslmode=require` is in connection string
3. Verify Neon project is not paused
4. Check firewall settings

### Authentication Errors

**Error**: `Invalid or expired session`

**Solutions**:
1. Check JWT_SECRET and SESSION_SECRET are set
2. Verify token hasn't expired (7-day default)
3. Clear cookies and sign in again

### Rate Limit Errors

**Error**: `Rate limit exceeded`

**Solutions**:
1. Wait for 24-hour reset
2. Increase `rate_limit_per_day` in database:
```sql
UPDATE agent_connections 
SET rate_limit_per_day = 10000 
WHERE api_key = 'your-key';
```

### Schema Errors

**Error**: Duplicate table or column

**Solution**: Drop and recreate schema:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run schema.sql again
```

## Security Best Practices

1. **Never commit .env files**
2. **Use different databases for dev/staging/prod**
3. **Rotate API keys regularly**
4. **Enable Neon IP allowlist in production**
5. **Monitor activity_logs for suspicious activity**
6. **Use HTTPS in production only**
7. **Set secure cookie flags in production**

## Performance Optimization

1. **Enable Neon Autoscaling**
2. **Add indexes for frequent queries**
3. **Use connection pooling**
4. **Cache frequently accessed data**
5. **Monitor slow queries in Neon dashboard**

## Next Steps

- [ ] Set up email notifications
- [ ] Add file upload for solution screenshots
- [ ] Implement advanced search with filters
- [ ] Add user reputation system
- [ ] Create admin dashboard
- [ ] Set up monitoring and alerts
- [ ] Add API rate limiting with Redis
- [ ] Implement real-time notifications with WebSockets

## Support

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/zeppelinlabs-tools/hunt.zehunt.com/issues
- **Neon Support**: https://neon.tech/docs
- **Email**: admin@hunt.zehunt.com

## License

MIT License - See LICENSE file for details
