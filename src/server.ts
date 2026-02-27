import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { analyzeLeaveHandler } from './tools/analyze-leave.js';
import { checkBalanceHandler } from './tools/check-balance.js';
import { checkConflictsHandler } from './tools/check-conflicts.js';
import { validatePolicyHandler } from './tools/validate-policy.js';
import { generateReportHandler } from './tools/generate-report.js';
import { analyzeReasonHandler } from './tools/analyze-reason.js';
import { manageHolidaysHandler } from './tools/manage-holidays.js';
import { leavePolicyResource } from './resources/leave-policy.js';
import { teamCalendarResource } from './resources/team-calendar.js';

export const server = new Server(
  { name: 'leave-analysis-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// ─── LIST TOOLS ───────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'analyze_leave_request',
      description: 'Full analysis of a leave request: balance check, policy validation, conflict detection, and recommendation.',
      inputSchema: {
        type: 'object',
        required: ['employee_id', 'leave_type', 'start_date', 'end_date'],
        properties: {
          employee_id: { type: 'string', description: 'Employee ID' },
          leave_type: { type: 'string', enum: ['annual','sick','maternity','paternity','unpaid','emergency'] },
          start_date: { type: 'string', description: 'YYYY-MM-DD' },
          end_date: { type: 'string', description: 'YYYY-MM-DD' },
          reason: { type: 'string' }
        }
      }
    },
    {
      name: 'analyze_leave_reason',
      description: 'Use Gemini AI to analyze the sentiment, risk, and empathy needed for a leave request reason.',
      inputSchema: {
        type: 'object',
        required: ['reason', 'leave_type'],
        properties: {
          reason: { type: 'string' },
          leave_type: { type: 'string' }
        }
      }
    },
    {
      name: 'check_leave_balance',
      description: 'Check current leave balance for an employee by type and year.',
      inputSchema: {
        type: 'object',
        required: ['employee_id'],
        properties: {
          employee_id: { type: 'string' },
          leave_type: { type: 'string' },
          year: { type: 'number' }
        }
      }
    },
    {
      name: 'check_team_conflicts',
      description: 'Check if team members have overlapping leaves during a date range.',
      inputSchema: {
        type: 'object',
        required: ['employee_id', 'start_date', 'end_date'],
        properties: {
          employee_id: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        }
      }
    },
    {
      name: 'validate_leave_policy',
      description: 'Validate a leave request against company policies.',
      inputSchema: {
        type: 'object',
        required: ['employee', 'leave_type', 'start_date', 'end_date', 'working_days', 'available'],
        properties: {
          employee: { type: 'object' },
          leave_type: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          reason: { type: 'string' },
          working_days: { type: 'number' },
          available: { type: 'number' }
        }
      }
    },
    {
      name: 'generate_leave_report',
      description: 'Generate a leave analysis report for a department or employee.',
      inputSchema: {
        type: 'object',
        properties: {
          employee_id: { type: 'string' },
          department: { type: 'string' },
          year: { type: 'number' },
          report_type: { type: 'string', enum: ['summary', 'detailed', 'balance'] }
        }
      }
    },
    {
      name: 'manage_holidays',
      description: 'Add, delete, or list public holidays in the database.',
      inputSchema: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['add', 'delete', 'list'] },
          holiday_date: { type: 'string', description: 'YYYY-MM-DD' },
          name: { type: 'string', description: 'Name of the holiday (required for add)' },
          country: { type: 'string', description: 'Country code (default: SA)' }
        }
      }
    }
  ]
}));

// ─── CALL TOOLS ───────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  switch (name) {
    case 'analyze_leave_request':   return analyzeLeaveHandler(args);
    case 'analyze_leave_reason':    return analyzeReasonHandler(args);
    case 'check_leave_balance':     return checkBalanceHandler(args);
    case 'check_team_conflicts':    return checkConflictsHandler(args);
    case 'validate_leave_policy':   return validatePolicyHandler(args);
    case 'generate_leave_report':   return generateReportHandler(args);
    case 'manage_holidays':         return manageHolidaysHandler(args);
    default: throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── RESOURCES ────────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'leave://policy/all', name: 'Leave Policies', mimeType: 'application/json' },
    { uri: 'leave://calendar/team', name: 'Team Calendar', mimeType: 'application/json' }
  ]
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri.startsWith('leave://policy')) return leavePolicyResource(uri);
  if (uri.startsWith('leave://calendar')) return teamCalendarResource(uri);
  throw new Error(`Unknown resource: ${uri}`);
});
