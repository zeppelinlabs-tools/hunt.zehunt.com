/**
 * Mock data representing Neon PostgreSQL DB models
 * Models: users, problems, attempts, solutions, verifications, mcp_events
 */

export const mockCurrentUser = {
  id: "usr_01h8q2hunt",
  email: "madnan@zehunt.com",
  username: "madnan",
  display_name: "Adnan Sultan",
  avatar_url: null,
  status: "active",
  created_at: "2026-09-01T12:00:00Z",
  stats: {
    problems_count: 14,
    solutions_count: 29,
    confirmations_count: 118,
    connected_agents_count: 4
  }
};

export const mockProblems = [
  {
    id: 4821,
    title: "Supabase authentication fails after Vercel deployment (returns 401 in production)",
    context: "Next.js App Router 15.0 with @supabase/ssr deployed to Vercel Serverless",
    environment: {
      node: "v22.1.0",
      next: "15.0.0",
      supabase_ssr: "0.5.2",
      deployment: "Vercel Production"
    },
    symptoms: "Works completely fine locally on localhost:3000. Immediately returns HTTP 401 Unauthorized in production on any server action or route handler.",
    tags: ["Next.js 15", "Supabase SSR", "Vercel", "Cookies", "HTTP 401"],
    author: {
      username: "alexander",
      display_name: "Alexander",
      avatar_initials: "AL"
    },
    status: "verified",
    confirmations_count: 8,
    helpful_votes: 14,
    created_at: "2 days ago",
    failed_attempts: [
      {
        attempt: "Regenerated Supabase Service Role and Anon keys on Vercel",
        result: "Failed",
        reason: "Root cause was not credential validity, but runtime cookie propagation. Changing keys caused temporary auth disconnects."
      },
      {
        attempt: "Downgraded Node.js from 22 to 20 on Vercel build settings",
        result: "Failed",
        reason: "The issue was agnostic to Node runtime version."
      },
      {
        attempt: "Removed middleware matcher configuration",
        result: "Failed",
        reason: "Caused static assets to execute server middleware without resolving the session token."
      }
    ],
    root_cause: "In @supabase/ssr, cookie mutations cannot occur during Server Component rendering. Next.js 15 requires cookie refreshing to occur strictly inside middleware.ts before reaching the downstream route, and response cookies must be copied back onto the request object.",
    solutions: [
      {
        id: "sol_01",
        title: "Propagate request/response cookies in middleware",
        status: "Author Verified",
        code: `import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
}`,
        why_it_works: "Ensures cookies refreshed by Supabase are visible to both Server Actions and downstream Route Handlers without losing the session token.",
        confirmations: 8
      }
    ],
    discussions: [
      {
        author: "dev_kelsey",
        time_ago: "1 day ago",
        confirmed: true,
        content: "Can confirm this fixed our team's staging deployment on Vercel! We lost 6 hours before finding this exact middleware cookie mutation rule."
      }
    ]
  },
  {
    id: 4819,
    title: "Neon Postgres connection pool exhaustion during Next.js Turbopack dev rebuilds",
    context: "Next.js 15 dev mode with Prisma client connecting directly to Neon pooler",
    environment: {
      node: "v20.14.0",
      next: "15.0.0",
      db: "Neon Serverless Postgres",
      orm: "Prisma 5.19"
    },
    symptoms: "FATAL: remaining connection slots are reserved for non-replication superuser connections. Hot module reload opens multiple unpooled instances.",
    tags: ["Neon DB", "Next.js 15", "Prisma ORM", "Connection Pooling"],
    author: {
      username: "sarah_dev",
      display_name: "Sarah Chen",
      avatar_initials: "SC"
    },
    status: "verified",
    confirmations_count: 5,
    helpful_votes: 27,
    created_at: "4 days ago",
    failed_attempts: [
      {
        attempt: "Increased max connection limits in database settings",
        result: "Failed",
        reason: "Turbopack fast reload spawned new processes faster than TCP idle timeouts could reclaim sockets."
      }
    ],
    root_cause: "Next.js dev rebuilds re-evaluate files, causing multiple PrismaClient instances unless attached to the globalThis singleton object.",
    solutions: [
      {
        id: "sol_02",
        title: "Attach PrismaClient instance to globalThis singleton",
        status: "Author Verified",
        code: `const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma`,
        why_it_works: "Prevents creating new TCP connections on hot module reloads.",
        confirmations: 5
      }
    ]
  },
  {
    id: 4812,
    title: "Claude Desktop MCP server hangs on Windows stdio transport over WSL2",
    context: "Configuring Model Context Protocol server inside WSL2 with Windows desktop client",
    environment: {
      os: "Windows 11 + WSL2 Ubuntu",
      client: "Claude Desktop v0.7",
      transport: "stdio (wsl.exe)"
    },
    symptoms: "Process spawns without error but pipe buffers indefinitely without flushing JSON-RPC handshake.",
    tags: ["MCP", "WSL2", "Node.js", "Claude"],
    author: {
      username: "kenji",
      display_name: "Kenji Sato",
      avatar_initials: "KS"
    },
    status: "investigating",
    confirmations_count: 0,
    helpful_votes: 9,
    created_at: "Yesterday",
    failed_attempts: [
      {
        attempt: "Added --no-deprecation flag to node runner",
        result: "Failed",
        reason: "Pipe buffering issue remained unchanged."
      }
    ],
    root_cause: "Windows wsl.exe stdio stream doesn't autoflush line-delimited JSON-RPC messages without explicit UTF-8 line endings.",
    solutions: []
  }
];

export const mockMcpLogs = [
  {
    time: "01:32:04",
    agent: "Cursor-Agent",
    type: "handshake",
    message: 'Initialized MCP session with scopes: ["knowledge:read", "search:execute"]'
  },
  {
    time: "01:32:10",
    agent: "Cursor-Agent",
    type: "tool_call",
    tool: "hunt_search",
    args: { query: "Next.js Supabase authentication 401 in production", framework: "Next.js 15" },
    response: "200 OK: Returned 3 problems. Best match: #4821 (Confidence 98.4%)"
  },
  {
    time: "01:32:14",
    agent: "Cursor-Agent",
    type: "tool_call",
    tool: "hunt_find_failed_attempts",
    args: { problem_id: 4821 },
    response: "200 OK: Warned agent against 3 redundant attempts (keys, node version, matcher)"
  },
  {
    time: "01:32:18",
    agent: "Cursor-Agent",
    type: "tool_call",
    tool: "hunt_get_solution",
    args: { problem_id: 4821 },
    response: "200 OK: Delivered verified solution code to AI agent context."
  }
];
