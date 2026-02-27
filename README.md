# Leave Analysis MCP Server

This MCP server allows Claude to analyze employee leave requests by checking balances, team conflicts, and company policies using a SQL Server database.

## 🛠️ Tech Stack
- **Node.js 20+**
- **TypeScript**
- **SQL Server (mssql)**
- **Model Context Protocol SDK**

## 📂 Configuration

1. **Environment Variables:**
   Create a `.env` file in the root directory (see `.env.example`):
   ```
   DB_SERVER=localhost
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   DB_NAME=LeaveDB
   DB_TRUST_SERVER_CERTIFICATE=true
   DB_PORT=1433
   ```

2. **Initialize Database:**
   Ensure your SQL Server is running and the database exists. Run the seed script to create tables and initial data:
   ```bash
   npx tsx data/seed.ts
   ```

3. **Build:**
   ```bash
   npm run build
   ```
   (Make sure you have a `build` script in `package.json` that runs `tsc`).

## 🔌 Client Integration

### Claude Desktop
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "leave-analysis": {
      "command": "node",
      "args": ["C:\\Study\\MCP\\mcp-leave-server\\dist\\index.js"],
      "env": {
        "DB_SERVER": "localhost",
        "DB_USER": "sa",
        "DB_PASSWORD": "YourPassword123",
        "DB_NAME": "LeaveDB",
        "DB_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```

### Gemini CLI
Add this to your `gemini_config.json` (typically in `~/.config/gemini/` or via `gemini mcp add`):
```json
{
  "mcpServers": {
    "leave-analysis": {
      "command": "node",
      "args": ["C:\\Study\\MCP\\mcp-leave-server\\dist\\index.js"],
      "env": {
        "DB_SERVER": "localhost",
        "DB_USER": "sa",
        "DB_PASSWORD": "YourPassword123",
        "DB_NAME": "LeaveDB",
        "DB_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```
Or use the CLI command:
```bash
gemini mcp add leave-analysis --command node --args C:\Study\MCP\mcp-leave-server\dist\index.js
```

## 🛠️ Tools

- `analyze_leave_request`: Comprehensive leave analysis (balance, conflict, policy).
- `check_leave_balance`: Check current balance for an employee.
- `check_team_conflicts`: Check for overlaps in the team.
- `validate_leave_policy`: Validate request against company rules.
- `generate_leave_report`: Get department or employee summary reports.

## 📊 Resources

- `leave://policy/all`: View all leave policies.
- `leave://calendar/team`: View current team leave calendar.
