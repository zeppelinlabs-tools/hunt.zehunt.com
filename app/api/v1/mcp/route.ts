import { NextRequest, NextResponse } from 'next/server';
import { ProblemModel, SolutionModel } from '@/lib/models/problem';
import { query } from '@/lib/db';

interface MCPRequest {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, any>;
  };
}

interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(apiKey: string, limit: number = 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(apiKey);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(apiKey, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

async function validateApiKey(apiKey: string) {
  const results = await query<{
    id: string;
    user_id: string;
    agent_name: string;
    scopes: string[];
    rate_limit_per_day: number;
    status: string;
  }>(
    `UPDATE agent_connections 
     SET last_used_at = NOW(), requests_count = requests_count + 1
     WHERE api_key = $1 AND status = 'active'
     RETURNING *`,
    [apiKey]
  );

  return results[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-hunt-api-key') || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json({
        error: {
          code: -32001,
          message: 'API key required. Provide X-Hunt-API-Key header.',
        },
      } as MCPResponse, { status: 401 });
    }

    // Validate API key
    const connection = await validateApiKey(apiKey);

    if (!connection) {
      return NextResponse.json({
        error: {
          code: -32002,
          message: 'Invalid or inactive API key',
        },
      } as MCPResponse, { status: 403 });
    }

    // Check rate limit
    if (!checkRateLimit(apiKey, connection.rate_limit_per_day)) {
      return NextResponse.json({
        error: {
          code: -32003,
          message: 'Rate limit exceeded. Daily limit: ' + connection.rate_limit_per_day,
        },
      } as MCPResponse, { status: 429 });
    }

    // Parse MCP request
    const mcpRequest: MCPRequest = await request.json();

    // Handle MCP methods
    switch (mcpRequest.method) {
      case 'tools/list':
        return NextResponse.json({
          result: {
            tools: [
              {
                name: 'search_problems',
                description: 'Search for problems with verified solutions based on error messages, stack traces, or symptoms',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Error message, stack trace, or symptom description' },
                    tags: { type: 'array', items: { type: 'string' }, description: 'Filter by technology tags' },
                    limit: { type: 'number', description: 'Maximum results to return (default: 10)' },
                  },
                  required: ['query'],
                },
              },
              {
                name: 'get_problem_details',
                description: 'Get complete details of a specific problem including failed attempts and verified solutions',
                inputSchema: {
                  type: 'object',
                  properties: {
                    problem_id: { type: 'string', description: 'Problem UUID or numeric ID' },
                  },
                  required: ['problem_id'],
                },
              },
              {
                name: 'get_verified_solutions',
                description: 'Get verified solutions for a specific problem with confirmation count and environment details',
                inputSchema: {
                  type: 'object',
                  properties: {
                    problem_id: { type: 'string', description: 'Problem UUID or numeric ID' },
                  },
                  required: ['problem_id'],
                },
              },
            ],
          },
        } as MCPResponse);

      case 'tools/call':
        const toolName = mcpRequest.params?.name;
        const toolArgs = mcpRequest.params?.arguments || {};

        switch (toolName) {
          case 'search_problems': {
            const { query: searchQuery, tags, limit = 10 } = toolArgs;

            const result = await ProblemModel.search({
              query: searchQuery,
              tags,
              status: 'verified',
              limit,
            });

            return NextResponse.json({
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      total: result.total,
                      problems: result.problems.map(p => ({
                        id: p.id,
                        title: p.title,
                        context: p.context,
                        error_message: p.error_message,
                        symptoms: p.symptoms,
                        root_cause: p.root_cause,
                        tags: p.tags,
                        helpful_votes: p.helpful_votes,
                      })),
                    }, null, 2),
                  },
                ],
              },
            } as MCPResponse);
          }

          case 'get_problem_details': {
            const { problem_id } = toolArgs;
            const problem = await ProblemModel.getWithDetails(problem_id);

            if (!problem) {
              return NextResponse.json({
                error: {
                  code: -32004,
                  message: 'Problem not found',
                },
              } as MCPResponse, { status: 404 });
            }

            return NextResponse.json({
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(problem, null, 2),
                  },
                ],
              },
            } as MCPResponse);
          }

          case 'get_verified_solutions': {
            const { problem_id } = toolArgs;
            const solutions = await SolutionModel.findByProblemId(problem_id);
            const verifiedSolutions = solutions.filter(s => s.state === 'verified');

            const solutionsWithConfirmations = await Promise.all(
              verifiedSolutions.map(async (solution) => {
                const confirmations = await SolutionModel.getConfirmations(solution.id);
                return { ...solution, confirmations };
              })
            );

            return NextResponse.json({
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(solutionsWithConfirmations, null, 2),
                  },
                ],
              },
            } as MCPResponse);
          }

          default:
            return NextResponse.json({
              error: {
                code: -32601,
                message: 'Tool not found: ' + toolName,
              },
            } as MCPResponse, { status: 404 });
        }

      default:
        return NextResponse.json({
          error: {
            code: -32601,
            message: 'Method not found: ' + mcpRequest.method,
          },
        } as MCPResponse, { status: 404 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('MCP endpoint error:', err);
    return NextResponse.json({
      error: {
        code: -32603,
        message: 'Internal error: ' + message,
      },
    } as MCPResponse, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Hunt-API-Key, Authorization',
    },
  });
}
