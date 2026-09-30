# Hunt — Architecture & Modules Master Index

This directory documents each of the 21 modules defined in the Hunt Product Requirements Document (`PRD.md`), specifying objectives, schemas, APIs, and implementation guidelines for translating into Next.js + Neon PostgreSQL + MCP.

---

## Module Overview

| Code | Module Name | Primary Role | Status in App |
|---|---|---|---|
| **M01** | [Identity & Authentication](./M01-Identity-Authentication.md) | Dev identity, OAuth, JWT/sessions, deletion | UI & JSON Backend Implemented |
| **M02** | [Developer Onboarding](./M02-Developer-Onboarding.md) | 3-step personalization wizard | UI & JSON Backend Implemented |
| **M03** | [Developer Profiles](./M03-Developer-Profiles.md) | Provenance, skills, tech, stats | UI & JSON Backend Implemented |
| **M04** | [Problem Knowledge](./M04-Problem-Knowledge.md) | Structured error, context, symptoms, root cause | UI & JSON Backend Implemented |
| **M05** | [Solutions](./M05-Solutions.md) | Multiple approaches, code, trade-offs, limits | UI & JSON Backend Implemented |
| **M06** | [Investigation & Failed Attempts](./M06-Investigation-Failed-Attempts.md) | Dead ends to warn developers & AI agents | UI & JSON Backend Implemented |
| **M07** | [Verification & Trust](./M07-Verification-Trust.md) | "Worked For Me" provenance & confirmation counts | UI & JSON Backend Implemented |
| **M08** | [Discussions & Comments](./M08-Discussions-Comments.md) | Classified comments (Confirmation, Clarification) | UI & JSON Backend Implemented |
| **M09** | [Voting & Reputation](./M09-Voting-Reputation.md) | "This was useful" feedback model | UI & JSON Backend Implemented |
| **M10** | [Search & Discovery](./M10-Search-Discovery.md) | Technical query search (errors, symptoms, stack) | UI & JSON Backend Implemented |
| **M11** | [Topics & Taxonomy](./M11-Topics-Taxonomy.md) | Frameworks, tags, environments | UI & JSON Backend Implemented |
| **M12** | [Bookmarks & Personal Knowledge](./M12-Bookmarks-Personal-Knowledge.md) | Reusable personal problem collections | UI & JSON Backend Implemented |
| **M13** | [MCP / Agent Platform](./M13-MCP-Agent-Platform.md) | Model Context Protocol gateway tools | UI & JSON Backend Implemented |
| **M14** | [Agent Permissions](./M14-Agent-Permissions.md) | Granular scopes (read/write/confirm) | UI & JSON Backend Implemented |
| **M15** | [Agent Activity & Audit](./M15-Agent-Activity-Audit.md) | Live audit stream of agent queries & tools | UI & JSON Backend Implemented |
| **M16** | [Security & Secret Protection](./M16-Security-Secret-Protection.md) | Sanitization & secret leak scanning | UI & JSON Backend Implemented |
| **M17** | [Moderation & Reporting](./M17-Moderation-Reporting.md) | Content flagging and moderation lifecycle | Documented / Planned |
| **M18** | [Notifications](./M18-Notifications.md) | Confirmations, mentions & solution alerts | Documented / Planned |
| **M19** | [Administration](./M19-Administration.md) | System health, users & problem management | Documented / Planned |
| **M20** | [Analytics](./M20-Analytics.md) | Search resolution metrics & agent activity | Documented / Planned |
| **M21** | [Intelligence Layer](./M21-Intelligence-Layer.md) | Semantic similarity, duplicate detection | Documented / Planned |

---

## Backend Strategy: JSON-File Based Simulation

During prototyping, all modules read and write to **JSON data stores** in `data/`:
- `data/users.json`
- `data/problems.json`
- `data/mcp_audit.json`

Next.js Route Handlers in `app/api/...` read and write to these files directly. This provides a realistic backend behavior with real HTTP responses, mutations, and query parameters before migrating to Neon PostgreSQL.
