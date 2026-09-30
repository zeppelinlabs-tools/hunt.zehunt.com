# Module M13, M14, M15, M16 — MCP Agent Platform, Permissions, Audit & Security

Hunt's major differentiator: exposing engineering knowledge directly to AI coding agents via Model Context Protocol (MCP).

## Module M13: MCP Tool Definitions
- `hunt_search({ query, framework? })`
- `hunt_get_problem({ id, include_failed_attempts? })`
- `hunt_get_solution({ problem_id, solution_id? })`
- `hunt_find_failed_attempts({ problem_id })`
- `hunt_find_similar({ error_text })`
- `hunt_get_discussion({ problem_id })`

## Module M14: Agent Permissions
- Scopes:
  - `knowledge:read`: Search and retrieve problems/solutions
  - `attempts:read`: Read dead-ends and failed attempts
  - `knowledge:write`: Draft creation (requires human review)
  - `community:confirm`: Verify solutions

## Module M15: Agent Activity & Audit Log
- Records every agent tool execution:
  - `timestamp`, `agent`, `tool`, `request_payload`, `response_summary`

## Module M16: Security & Secret Protection
- Secret detection pipeline scanning for:
  - API keys, AWS credentials, DB URLs, Private keys, JWT tokens
  - Validates and warns before storage.

## JSON-Backend API Endpoints
- `POST /api/mcp/gateway` (Executes tools and appends to `mcp_audit.json`)
- `GET /api/mcp/audit`
- `GET /api/mcp/permissions`
- `POST /api/mcp/permissions`
