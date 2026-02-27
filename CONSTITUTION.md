# Constitution: MCP Leave Analysis Server

## 🎯 Purpose
To provide a reliable, policy-compliant, and data-driven Model Context Protocol (MCP) server for analyzing employee leave requests.

## 🧱 Principles
- **Accuracy First:** Calculations for leave balances and working days must be precise, accounting for weekends and public holidays.
- **Policy Adherence:** No leave request should be recommended for approval if it violates a blocking company policy.
- **Privacy & Security:** Employee data must be handled securely; no secrets or personal credentials should be stored in the codebase.
- **Enterprise Ready:** Use SQL Server for a robust, scalable data layer suitable for corporate environments.
- **MCP Compliance:** Adhere strictly to the Model Context Protocol standards for tools, resources, and transports.

## 🛠️ Tech Stack Constraints
- **Runtime:** Node.js 20+
- **Language:** TypeScript (Strict mode)
- **Database:** SQL Server (via `mssql` package)
- **Validation:** `zod` for all tool inputs
- **Date Handling:** `date-fns` for consistent date logic
