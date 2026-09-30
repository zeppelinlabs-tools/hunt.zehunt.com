# Module M04, M05, M06, M07 — Problem Knowledge, Solutions, Failed Attempts & Trust

This represents the core technical loop of Hunt.

## Module M04: Problem Knowledge Structure
Captures engineering problems in a structured schema:
- `Title`
- `Status`: `Draft`, `Published`, `Investigating`, `Solved`, `Verified`, `Archived`
- `Context`: Stack and environment overview
- `Environment`: Exact runtime, package versions, OS, deployment target
- `Error`: Error logs, messages, status codes
- `Symptoms`: Array of observed symptoms vs expectations
- `Root Cause`: Deep technical root cause
- `Tags`: Framework and domain taxonomy

## Module M05: Solutions (Multiple Approaches)
Problems allow multiple approaches:
- `Title`, `State` (`Proposed`, `Author Verified`, `Community Confirmed`, `Deprecated`)
- `Code`: Syntax-highlighted code/config
- `Why it works`: Mechanics
- `Trade-offs` & `Limitations`
- `Author` & `Confirmations Count`

## Module M06: Investigation & Failed Attempts (Key Hunt Differentiator)
Preserves dead-ends and discarded attempts:
- `Attempt description`
- `Result` (`Failed`)
- `Reason failed` (why it didn't solve the root cause)
**Impact:** AI agents querying Hunt read failed attempts and avoid repeating wasted debugging actions (e.g. key rotation, node downgrades).

## Module M07: Verification & Trust
- `verified_by`, `verified_at`, `environment`, `version`, `confirmation_count`
- Provides the "Worked For Me" confirmation mechanism.

## JSON-Backend API Endpoints
- `GET /api/problems` (Supports `?query=...&tag=...`)
- `GET /api/problems/:id`
- `POST /api/problems`
- `POST /api/problems/:id/confirm`
- `POST /api/problems/:id/vote`
