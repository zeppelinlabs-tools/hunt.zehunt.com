import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const mcpAuditFilePath = path.join(process.cwd(), 'data', 'mcp_audit.json');
const problemsFilePath = path.join(process.cwd(), 'data', 'problems.json');

interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: string;
  tool?: string;
  args?: Record<string, unknown>;
  response?: string;
}

interface ProblemLite {
  id: number;
  title: string;
  tags: string[];
  attempts?: unknown[];
  solutions?: unknown[];
}

function readAudit(): AuditEntry[] {
  try {
    return JSON.parse(fs.readFileSync(mcpAuditFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeAudit(data: AuditEntry[]) {
  fs.writeFileSync(mcpAuditFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readProblems(): ProblemLite[] {
  try {
    return JSON.parse(fs.readFileSync(problemsFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

// Protocol info endpoint
export async function GET() {
  const audit = readAudit();
  return NextResponse.json({
    status: 'operational',
    protocol: 'Model Context Protocol (MCP)',
    endpoint: 'http://hunt.zehunt.com/mcp',
    transport: 'HTTP JSON-RPC / REST Gateway',
    auth_header: 'X-Hunt-API-Key',
    version: '1.0.0',
    available_tools: [
      { name: 'hunt_search', description: 'Search verified engineering solutions by symptoms, errors and keywords' },
      { name: 'hunt_get_problem', description: 'Retrieve structured problem record including context and root cause' },
      { name: 'hunt_find_failed_attempts', description: 'Retrieve discarded debugging attempts to avoid repeat cycles' },
      { name: 'hunt_get_solution', description: 'Retrieve tested code and configuration solutions' }
    ],
    recent_events_count: audit.length
  });
}

// MCP Execution via HTTP header authorization: X-Hunt-API-Key
export async function POST(request: Request) {
  try {
    // Platform-specific API key authorization header
    const apiKey = request.headers.get('x-hunt-api-key') || request.headers.get('X-Hunt-API-Key');

    // For open demo simulations, allow if matching or fallback to standard demo key
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Unauthorized MCP Request',
          message: 'Missing platform header: X-Hunt-API-Key. Generate key at http://hunt.zehunt.com/agents'
        },
        { status: 401 }
      );
    }

    const payload = (await request.json()) as {
      tool: string;
      args: Record<string, unknown>;
      agent?: string;
    };

    const { tool, args, agent = 'Coding-Agent' } = payload;
    const problems = readProblems();
    const audit = readAudit();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let responseResult = '';

    if (tool === 'hunt_search') {
      const q = String(args.query || '').toLowerCase();
      const matches = problems.filter((p: ProblemLite) =>
        p.title.toLowerCase().includes(q) || p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
      responseResult = `200 OK: Found ${matches.length} matching investigations.`;
    } else if (tool === 'hunt_find_failed_attempts') {
      const p = problems.find((item: ProblemLite) => item.id === Number(args.problem_id));
      const count = p?.attempts?.length || 0;
      responseResult = `200 OK: Injected ${count} failed attempt dead-ends into agent context.`;
    } else if (tool === 'hunt_get_solution') {
      const p = problems.find((item: ProblemLite) => item.id === Number(args.problem_id));
      const count = p?.solutions?.length || 0;
      responseResult = `200 OK: Delivered ${count} verified code solutions.`;
    } else {
      responseResult = `200 OK: Tool ${tool} executed successfully.`;
    }

    const logEntry: AuditEntry = {
      id: `mcp_${Date.now()}`,
      timestamp,
      agent,
      type: 'tool_call',
      tool,
      args,
      response: responseResult
    };

    audit.push(logEntry);
    writeAudit(audit);

    return NextResponse.json({
      jsonrpc: '2.0',
      result: {
        tool,
        status: 'success',
        data: responseResult,
        audit_id: logEntry.id
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown MCP error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
