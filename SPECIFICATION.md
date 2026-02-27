# Specification: Leave Analysis MCP Server

## 🎯 Goal
Implement an MCP Server that enables LLM clients (like Claude) to analyze employee leave requests.

## 🛠️ User Stories
1. **As a Manager**, I want to analyze a leave request to see if it conflicts with other team members or violates company policy.
2. **As an Employee**, I want to check my current leave balance for the year.
3. **As an HR Specialist**, I want to generate a summary report of leave usage by department.
4. **As an LLM**, I want clear tool definitions to accurately assist the user in processing leave requests.

## ⚙️ Core Functionality

### 1. Tool: `analyze_leave_request`
- **Input:** `employee_id`, `leave_type`, `start_date`, `end_date`, `reason` (optional).
- **Process:**
  - Calculate `working_days` (excluding weekends and public holidays).
  - Check `leave_balance` for the given `leave_type` and `year`.
  - Detect `team_conflicts` with other employees in the same department.
  - Validate against `leave_policies`.
- **Output:** Detailed analysis report with a recommendation (`approve`, `reject`, or `review`).

### 2. Tool: `check_leave_balance`
- **Input:** `employee_id`, `leave_type` (optional), `year` (optional).
- **Output:** Current balance (Total, Used, Pending, Available).

### 3. Tool: `check_team_conflicts`
- **Input:** `employee_id`, `start_date`, `end_date`.
- **Output:** List of overlapping leave requests from the same department.

### 4. Tool: `validate_leave_policy`
- **Input:** `employee_id`, `leave_type`, `start_date`, `end_date`, `reason`.
- **Output:** List of policy violations (if any) and whether they are "blocking."

### 5. Tool: `generate_leave_report`
- **Input:** `employee_id` (optional), `department` (optional), `year` (optional), `report_type`.
- **Output:** Summary statistics or detailed leave records.

## 📊 Resources
- `leave://policy/all`: Full leave policy documentation as JSON.
- `leave://calendar/team`: Current team calendar showing all pending and approved leaves.

## 💾 Data Layer (SQL Server Schema)
- `employees`: Core employee data.
- `leave_balances`: Annual/Sick/Unpaid balances by year.
- `leave_requests`: All historical and current leave requests.
- `leave_policies`: Set of rules to validate against.
- `public_holidays`: List of non-working days.
