# Tasks: Leave Analysis MCP Server Implementation

## 📂 Phase 1: Foundation (Project Setup & Data Layer)
- [ ] **Task 1.1:** Initialize project directory and `package.json`.
- [ ] **Task 1.2:** Install dependencies: `@modelcontextprotocol/sdk`, `mssql`, `date-fns`, `zod`, `dotenv`.
- [ ] **Task 1.3:** Setup TypeScript configuration (`tsconfig.json`).
- [ ] **Task 1.4:** Create SQL Server schema scripts (`data/schema.sql`).
- [ ] **Task 1.5:** Create database seeding script (`data/seed.ts`).
- [ ] **Task 1.6:** Implement database connection utility using `mssql` (`src/data/db.ts`).
- [ ] **Task 1.7:** Setup `.env` configuration for SQL Server (Server, User, Password, DB).

## 📂 Phase 2: Domain Logic & Core Tools
- [ ] **Task 2.1:** Define TypeScript interfaces (`src/types/index.ts`).
- [ ] **Task 2.2:** Implement `getLeaveBalance` logic in `src/data/balances.ts`.
- [ ] **Task 2.3:** Implement `check_leave_balance` tool handler.
- [ ] **Task 2.4:** Implement `getTeamLeaves` logic in `src/data/leaves.ts`.
- [ ] **Task 2.5:** Implement `check_team_conflicts` tool handler.
- [ ] **Task 2.6:** Implement `validatePolicies` logic and `validate_leave_policy` tool handler.
- [ ] **Task 2.7:** Implement `generate_leave_report` tool handler.

## 📂 Phase 3: The Analysis Engine
- [ ] **Task 3.1:** Implement `calculateWorkingDays` (excluding weekends/holidays).
- [ ] **Task 3.2:** Implement `calculateRiskScore` and recommendation logic.
- [ ] **Task 3.3:** Implement `analyze_leave_request` tool handler.
- [ ] **Task 3.4:** Implement `leave://policy/all` and `leave://calendar/team` resources.

## 📂 Phase 4: Server Integration & Testing
- [ ] **Task 4.1:** Setup `src/server.ts` with MCP server instance and registered handlers.
- [ ] **Task 4.2:** Setup `src/index.ts` with `StdioServerTransport`.
- [ ] **Task 4.3:** Build project and verify via `mcp-inspector`.
- [ ] **Task 4.4:** Provide Claude Desktop configuration example.

## 🏁 Completion Criteria
- [ ] All 5 tools are fully functional and return valid JSON.
- [ ] Both resources are readable and return correct data.
- [ ] `analyze_leave_request` correctly identifies conflicts and policy violations.
- [ ] The server passes `mcp-inspector` validation.
