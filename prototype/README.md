# Hunt Prototype Suite

This folder contains the complete, interactive prototype for **Hunt — Developer Knowledge Network**, built directly from the **PRD** (`PRD.md`) and the **Hunt Design System** (`design.md`).

---

## 1. How to Open the Prototypes

Both prototype files are self-contained, standalone web applications that run in any modern web browser without dependencies, builds, or server requirements:

### **A. Full Platform Prototype (Modules M02 – M21)**
Open this file directly in your browser:
```text
file:///C:/Users/madnansultan/OneDrive/Desktop/hunt.zehunt/prototype/hunt-platform.html
```

### **B. Identity & Authentication Prototype (Module M01)**
Open this file directly in your browser:
```text
file:///C:/Users/madnansultan/OneDrive/Desktop/hunt.zehunt/prototype/index.html
```

---

## 2. Complete Coverage of PRD Modules in `hunt-platform.html`

The updated `hunt-platform.html` contains every element specified in the PRD:

### **Module M02 — Developer Onboarding (Complete 3-Step Wizard)**
- **Step 1 ("What do you build?")**: Multi-select chips for Web, Mobile, Backend, AI / ML, DevOps, Cloud, Data, Open Source, Desktop, Security.
- **Step 2 ("What problems do you encounter?")**: Multi-select chips for Debugging, Deployment, Architecture, Performance, Databases, APIs, Authentication, AI / LLM, DevOps, Security.
- **Step 3 ("Tools")**: Multi-select chips for VS Code, Cursor, Kiro, Claude, ChatGPT, Other.
- Interactive step-by-step navigation saving preferences to personalize knowledge streams.

### **Module M03 — Developer Profiles & M12 Bookmarks**
- **Profile Header**: Avatar, Display Name, Username (`@madnan`), Bio, Skills, Technologies, Website, and GitHub links.
- **PRD Statistics**: Problems logged, Verified Solutions, Confirmations count, Helpful votes, and Connected AI agents.
- **Tabs**: Problems, Solutions, Discussions, and **Bookmarks & Collections (M12)** (accessible to user's AI agents).

### **Module M04 — Problem Knowledge (Core Hunt Module)**
- Full structured view:
  - **Title** & **Status** (`Draft`, `Published`, `Investigating`, `Solved`, `Verified`, `Archived`).
  - **Context**: Project stack description.
  - **Environment**: Exact matrix (Node runtime, Next.js version, ORM, Deployment platform).
  - **Error & Symptoms**: Dedicated error logs and observed symptom bullet points.
  - **Root Cause**: Explicit analysis of underlying technical failure.
  - **Tags**: Taxonomy for quick lookup.

### **Module M05 — Solutions (Multiple Approaches)**
- Displays multiple solutions per problem (e.g. Solution A vs Solution B alternative approach).
- **Structure**: Title, Code block with syntax highlighting, **Why it works**, **Trade-offs**, and **Limitations**.
- **States**: `Proposed`, `Author Verified`, `Community Confirmed`, `Deprecated`.

### **Module M06 — Investigation & Failed Attempts (Key Hunt Differentiator)**
- Highlights dead ends and discarded approaches (e.g., *Regenerated keys*, *Downgraded Node*, *Disabled middleware matcher*).
- Displays exact reasons why each attempt failed to warn developers and AI agents against repeat debugging loops.

### **Module M07 — Verification & Trust**
- Shows author verification, verification date, tested environment versions, and community confirmation counters.
- Interactive **"Worked For Me"** button allowing developers to register confirmations.

### **Module M08 — Discussions & Classified Comments**
- Comments classified by PRD types: `Clarification`, `Confirmation`, `Alternative`, `Correction`, `Experience`, `Question`.
- Displays version reported with each comment.
- Interactive comment composer with category selector.

### **Module M09 — Voting & Feedback**
- Upvoting mechanism ("This was useful") with live counters.

### **Module M10 & M11 — Search, Discovery & Taxonomy**
- Real-time technical search bar (`⌘K`) matching titles, error codes, and symptoms.
- Framework taxonomy filter buttons (Next.js, Neon Postgres, Supabase, MCP).

### **Module M13, M14, M15 — MCP / Agent Platform**
- Live interactive terminal visualizing MCP tool execution:
  - `hunt_search`
  - `hunt_get_problem`
  - `hunt_get_solution`
  - `hunt_find_failed_attempts`
- **M14 Agent Permissions**: Granular scope toggles (`knowledge:read`, `attempts:read`, `knowledge:write`, `community:confirm`).
- **M15 Agent Activity Audit**: List of connected agents (Cursor, Claude Desktop, Kiro) and recent actions.

### **Module M16 — Security & Secret Protection**
- Real-time secret scanning indicator on problem creation guarding against leaked API keys, AWS credentials, and database connection strings.

---

## 3. Module M01 — Identity & Authentication in `index.html`

Covers all 5 core authentication views:
1. **Sign In**: GitHub and Google OAuth + email/password.
2. **Sign Up**: Developer handle reservation with `hunt.dev/@` namespace + password strength meter.
3. **Email Verification**: Verification dispatch notice and resend simulation.
4. **Password Reset**: Safe recovery flow without account enumeration leaks.
5. **Sessions & Security**: Active client instances table (browser sessions and AI agent tokens with single/batch revoke actions) and Danger Zone account deletion (`status = deleted`).
