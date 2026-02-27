export interface Employee {
  id: string;
  name: string;
  department: string;
  manager_id: string | null;
  annual_leave_days: number;
  sick_leave_days: number;
  join_date: string;
}

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  employee_id: string;
  leave_type: LeaveType;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  available_days: number; // computed: total - used - pending
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  working_days: number;
  reason?: string;
  status: LeaveStatus;
  submitted_at: string;
}

export interface AnalysisResult {
  request: LeaveRequest;
  employee: Employee;
  balance: LeaveBalance;
  conflicts: ConflictInfo[];
  policyViolations: PolicyViolation[];
  recommendation: 'approve' | 'reject' | 'review';
  recommendationReasons: string[];
  riskScore: number; // 0-100, higher = more risk
}

export interface ConflictInfo {
  type: 'team_member_absent' | 'critical_period' | 'minimum_coverage';
  description: string;
  severity: 'low' | 'medium' | 'high';
  conflicting_employee?: string;
}

export interface PolicyViolation {
  rule: string;
  description: string;
  blocking: boolean; // true = must reject
}

export interface DepartmentSummary {
  department: string;
  total_employees: number;
  total_leaves_this_year: number;
  on_leave_today: number;
}
