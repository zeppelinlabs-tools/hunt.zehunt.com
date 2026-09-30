# Hunt Platform API Documentation

Base URL: `https://hunt.zehunt.com/api/v1`
Development: `http://localhost:3000/api/v1`

## Authentication

All authenticated endpoints require either:
- **Cookie**: `hunt_session` (set automatically on sign in)
- **Header**: `Authorization: Bearer <token>`

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "display_name": "Display Name",
  "password": "SecurePassword123!",
  "bio": "Optional bio",
  "skills": ["TypeScript", "React"],
  "technologies": ["Next.js", "PostgreSQL"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "display_name": "Display Name",
    "role": "developer",
    "status": "active"
  },
  "token": "session-token"
}
```

#### POST /auth/signin
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "session-token"
}
```

#### POST /auth/signout
Sign out current session. Requires authentication.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

#### GET /auth/me
Get current authenticated user with stats.

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* user object */ },
  "stats": {
    "problems_count": 14,
    "solutions_count": 29,
    "confirmations_count": 118,
    "helpful_votes": 342,
    "connected_agents_count": 4
  }
}
```

### Problems

#### GET /problems
List and search problems.

**Query Parameters:**
- `q` - Search query (searches title, context, error message)
- `tags` - Comma-separated tags (e.g., `Next.js,Vercel`)
- `status` - Filter by status (`draft`, `published`, `verified`, `investigating`, `archived`)
- `author_id` - Filter by author UUID
- `limit` - Results per page (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "problems": [
    {
      "id": "uuid",
      "title": "Problem title",
      "slug": "problem-slug",
      "status": "verified",
      "context": "Problem context...",
      "environment": {
        "node": "v20.11.0",
        "next": "15.0.0"
      },
      "error_message": "Error message...",
      "symptoms": ["Symptom 1", "Symptom 2"],
      "root_cause": "Root cause explanation",
      "tags": ["Next.js", "Vercel"],
      "author_id": "uuid",
      "helpful_votes": 14,
      "view_count": 342,
      "created_at": "2026-10-01T00:00:00Z",
      "updated_at": "2026-10-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

#### POST /problems
Create a new problem. Requires authentication.

**Request:**
```json
{
  "title": "Problem title",
  "context": "Detailed context about the problem",
  "environment": {
    "node": "v20.11.0",
    "next": "15.0.0",
    "deployment": "Vercel Production"
  },
  "error_message": "Optional error message",
  "symptoms": [
    "Works locally",
    "Fails in production"
  ],
  "tags": ["Next.js", "Vercel", "Build Error"],
  "status": "published"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "problem": { /* problem object */ }
}
```

#### GET /problems/:id
Get problem details with attempts, solutions, and discussions.

**Response:** `200 OK`
```json
{
  "success": true,
  "problem": {
    /* problem object */,
    "attempts": [
      {
        "id": "uuid",
        "description": "What was tried",
        "result": "failed",
        "reason": "Why it didn't work",
        "order_index": 1
      }
    ],
    "solutions": [/* solution objects */],
    "discussions": [/* discussion objects */]
  }
}
```

#### PATCH /problems/:id
Update a problem. Requires ownership or admin role.

**Request:**
```json
{
  "title": "Updated title",
  "status": "verified",
  "root_cause": "Identified root cause"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "problem": { /* updated problem */ }
}
```

#### DELETE /problems/:id
Archive a problem. Requires ownership or admin role.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Problem archived successfully"
}
```

### Solutions

#### GET /problems/:id/solutions
Get all solutions for a problem with confirmations.

**Response:** `200 OK`
```json
{
  "success": true,
  "solutions": [
    {
      "id": "uuid",
      "problem_id": "uuid",
      "title": "Solution title",
      "state": "verified",
      "code": "// Solution code...",
      "explanation": "Explanation...",
      "why_it_works": "Why this works...",
      "trade_offs": "Trade-offs...",
      "limitations": "Limitations...",
      "author_id": "uuid",
      "confirmation_count": 8,
      "confirmations": [
        {
          "user_id": "uuid",
          "environment": { /* environment */ },
          "version_info": "Next.js 15.0.0",
          "notes": "Worked perfectly"
        }
      ]
    }
  ]
}
```

#### POST /problems/:id/solutions
Add a solution to a problem. Requires authentication.

**Request:**
```json
{
  "title": "Solution title",
  "code": "// Solution code (optional)",
  "explanation": "Detailed explanation",
  "why_it_works": "Why this solution works",
  "trade_offs": "Trade-offs to consider",
  "limitations": "Known limitations",
  "state": "proposed"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "solution": { /* solution object */ }
}
```

### MCP Protocol

#### POST /mcp
Model Context Protocol endpoint for AI agents.

**Headers:**
- `X-Hunt-API-Key: hunt_sk_xxx` (required)

**Request - List Tools:**
```json
{
  "method": "tools/list"
}
```

**Response:**
```json
{
  "result": {
    "tools": [
      {
        "name": "search_problems",
        "description": "Search for problems with verified solutions",
        "inputSchema": { /* JSON Schema */ }
      },
      {
        "name": "get_problem_details",
        "description": "Get complete problem details",
        "inputSchema": { /* JSON Schema */ }
      },
      {
        "name": "get_verified_solutions",
        "description": "Get verified solutions for a problem",
        "inputSchema": { /* JSON Schema */ }
      }
    ]
  }
}
```

**Request - Call Tool:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "search_problems",
    "arguments": {
      "query": "authentication fails",
      "tags": ["Next.js", "Supabase"],
      "limit": 5
    }
  }
}
```

**Response:**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ /* JSON results */ }"
      }
    ]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limits

- **Authenticated API**: 10,000 requests per day per user
- **MCP Endpoint**: Configurable per API key (default: 1,000/day)

Rate limit headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## MCP Error Codes

MCP-specific errors use JSON-RPC error codes:

- `-32001` - API key required
- `-32002` - Invalid or inactive API key
- `-32003` - Rate limit exceeded
- `-32004` - Resource not found
- `-32601` - Method or tool not found
- `-32603` - Internal error

## Examples

### Complete Problem Workflow

1. **Search for existing problem:**
```bash
curl "https://hunt.zehunt.com/api/v1/problems?q=supabase+auth"
```

2. **Create new problem if not found:**
```bash
curl -X POST https://hunt.zehunt.com/api/v1/problems \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @problem.json
```

3. **Add solution:**
```bash
curl -X POST https://hunt.zehunt.com/api/v1/problems/PROBLEM_ID/solutions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @solution.json
```

4. **Get complete problem with solutions:**
```bash
curl https://hunt.zehunt.com/api/v1/problems/PROBLEM_ID
```

### MCP Integration Example

```typescript
// In your AI agent
const response = await fetch('https://hunt.zehunt.com/api/v1/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hunt-API-Key': process.env.HUNT_API_KEY,
  },
  body: JSON.stringify({
    method: 'tools/call',
    params: {
      name: 'search_problems',
      arguments: {
        query: errorMessage,
        tags: ['Next.js'],
        limit: 3,
      },
    },
  }),
});

const data = await response.json();
const problems = JSON.parse(data.result.content[0].text);
```

## Webhooks (Coming Soon)

Subscribe to events:
- `problem.created`
- `solution.added`
- `solution.verified`
- `discussion.added`

## SDK Libraries (Coming Soon)

- JavaScript/TypeScript SDK
- Python SDK
- Ruby SDK
- Go SDK

## Support

- Documentation: https://hunt.zehunt.com/docs
- API Status: https://status.hunt.zehunt.com
- GitHub Issues: https://github.com/zeppelinlabs-tools/hunt.zehunt.com/issues
- Email: api@hunt.zehunt.com
