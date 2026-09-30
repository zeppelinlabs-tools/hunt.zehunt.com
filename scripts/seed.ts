import { neon } from '@neondatabase/serverless';
import { hash } from 'bcrypt';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await hash('admin123', 10);
    const adminId = crypto.randomUUID();

    await sql`
      INSERT INTO users (id, email, username, display_name, password_hash, role, status, bio, created_at, updated_at)
      VALUES (
        ${adminId},
        'admin@hunt.zehunt.com',
        'admin',
        'Hunt Admin',
        ${adminPassword},
        'admin',
        'active',
        'Platform administrator and trust governance lead',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✅ Admin user created (email: admin@hunt.zehunt.com, password: admin123)\n');

    // Create developer user
    console.log('Creating developer user...');
    const devPassword = await hash('dev123', 10);
    const devId = crypto.randomUUID();

    await sql`
      INSERT INTO users (
        id, email, username, display_name, password_hash, role, status, 
        bio, skills, technologies, github, created_at, updated_at
      )
      VALUES (
        ${devId},
        'madnan@zehunt.com',
        'madnan',
        'Adnan Sultan',
        ${devPassword},
        'developer',
        'active',
        'Staff Software Engineer building distributed AI systems and Next.js applications',
        ARRAY['TypeScript', 'Next.js', 'PostgreSQL', 'Neon', 'MCP'],
        ARRAY['React 19', 'Prisma', 'Docker', 'Node 22', 'Tailwind CSS'],
        'https://github.com/zehunt',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✅ Developer user created (email: madnan@zehunt.com, password: dev123)\n');

    // Create sample problem
    console.log('Creating sample problem...');
    const problemId = crypto.randomUUID();
    const problemSlug = 'supabase-authentication-fails-after-vercel-deployment';

    await sql`
      INSERT INTO problems (
        id, title, slug, status, context, environment, error_message, 
        symptoms, root_cause, tags, author_id, helpful_votes, created_at, updated_at
      )
      VALUES (
        ${problemId},
        'Supabase authentication fails after Vercel deployment',
        ${problemSlug},
        'verified',
        'Next.js application using Supabase SSR authentication deployed on Vercel Serverless.',
        '{"node": "v22.1.0", "next": "Next.js 15.0.0", "supabase": "@supabase/ssr 0.5.2", "deployment": "Vercel Production"}'::jsonb,
        'HTTP 401 Unauthorized: Auth session missing or cookie invalid during Route Handler execution.',
        ARRAY[
          'Works locally on localhost:3000',
          'Returns 401 in production on server action or API call'
        ],
        'Authentication cookie was not correctly propagated in middleware. Response cookies must be copied back onto request headers.',
        ARRAY['Next.js', 'Supabase', 'Vercel', 'Authentication', 'Cookies', 'HTTP 401'],
        ${devId},
        14,
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log('✅ Sample problem created\n');

    // Create failed attempts
    console.log('Creating failed attempts...');
    await sql`
      INSERT INTO failed_attempts (id, problem_id, description, result, reason, order_index, created_at)
      VALUES 
        (
          ${crypto.randomUUID()},
          ${problemId},
          'Changed environment variables (regenerated Supabase Anon and Service Role keys)',
          'failed',
          'The issue was related to authentication cookies not propagating, not invalid API credentials.',
          1,
          NOW()
        ),
        (
          ${crypto.randomUUID()},
          ${problemId},
          'Reinstalled dependencies and changed Node.js version from 22 to 20',
          'failed',
          'Persisted across all Node runtime versions.',
          2,
          NOW()
        )
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Failed attempts created\n');

    // Create solution
    console.log('Creating verified solution...');
    const solutionId = crypto.randomUUID();

    await sql`
      INSERT INTO solutions (
        id, problem_id, title, state, code, explanation, why_it_works, 
        trade_offs, limitations, author_id, confirmation_count, created_at, updated_at
      )
      VALUES (
        ${solutionId},
        ${problemId},
        'Solution: Synchronize response cookies back to request headers in middleware',
        'verified',
        'import { createServerClient } from ''@supabase/ssr''
import { NextResponse, type NextRequest } from ''next/server''

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.getUser()
  return response
}',
        'Ensures cookies mutated or refreshed by Supabase are visible to both Server Actions and downstream Route Handlers without dropping session credentials.',
        'Ensures cookies mutated or refreshed by Supabase are visible to both Server Actions and downstream Route Handlers.',
        'Slight edge compute latency increase on first request to run getUser().',
        'Requires all routes with authenticated actions to pass through middleware matcher.',
        ${devId},
        8,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Verified solution created\n');

    // Create MCP API key for testing
    console.log('Creating MCP API key for testing...');
    const apiKey = 'hunt_sk_' + crypto.randomUUID().replace(/-/g, '');

    await sql`
      INSERT INTO agent_connections (
        id, user_id, agent_name, agent_type, api_key, 
        scopes, rate_limit_per_day, status, created_at
      )
      VALUES (
        ${crypto.randomUUID()},
        ${devId},
        'Development Agent',
        'other',
        ${apiKey},
        ARRAY['knowledge:read', 'attempts:read', 'solutions:read'],
        10000,
        'active',
        NOW()
      )
      ON CONFLICT (api_key) DO NOTHING
    `;
    console.log('✅ MCP API key created\n');
    console.log(`   API Key: ${apiKey}\n`);
    console.log('   Use this in your MCP config:\n');
    console.log('   {');
    console.log('     "hunt": {');
    console.log('       "endpoint": "http://localhost:3000/api/v1/mcp",');
    console.log(`       "headers": { "X-Hunt-API-Key": "${apiKey}" }`);
    console.log('     }');
    console.log('   }\n');

    console.log('✅ Database seeded successfully!\n');
    console.log('📝 Summary:');
    console.log('   - Admin user: admin@hunt.zehunt.com / admin123');
    console.log('   - Developer user: madnan@zehunt.com / dev123');
    console.log('   - Sample problem with verified solution');
    console.log(`   - MCP API key: ${apiKey}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
