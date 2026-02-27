import { differenceInBusinessDays, parseISO, isWeekend, eachDayOfInterval } from 'date-fns';
import { getLeaveBalance } from '../data/balances.js';
import { getTeamLeaves, getEmployee as getEmp, getPublicHolidays } from '../data/leaves.js';
import { validatePolicies } from './validate-policy.js';
import type { AnalysisResult, ConflictInfo, PolicyViolation, Employee, LeaveType } from '../types/index.js';

export async function analyzeLeaveHandler(args: any) {
  const { employee_id, leave_type, start_date, end_date, reason } = args;

  // 1. Fetch employee data
  const employee = await getEmp(employee_id);
  if (!employee) throw new Error(`Employee ${employee_id} not found`);

  // 2. Fetch Public Holidays
  const holidays = await getPublicHolidays('SA');

  // 3. Calculate working days (excluding weekends + public holidays)
  const working_days = calculateWorkingDays(start_date, end_date, holidays);

  // 4. Check leave balance
  const targetYear = parseISO(start_date).getFullYear();
  const balance = await getLeaveBalance(employee_id, leave_type as LeaveType, targetYear);
  const available = balance.total_days - balance.used_days - balance.pending_days;

  // 5. Detect team conflicts
  const teamLeaves = await getTeamLeaves(employee.department, start_date, end_date);
  const conflicts: ConflictInfo[] = teamLeaves
    .filter(c => c.employee_id !== employee_id)
    .map(c => ({
      type: 'team_member_absent',
      description: `Overlap with ${c.employee_id} (${c.leave_type})`,
      severity: 'medium',
      conflicting_employee: c.employee_id
    }));

  // 6. Validate against policies
  const violations: PolicyViolation[] = validatePolicies({
    employee,
    leave_type: leave_type as LeaveType,
    start_date,
    end_date,
    reason,
    working_days,
    available
  });

  // 7. Calculate risk score and recommendation
  const riskScore = calculateRiskScore(conflicts, violations, available, working_days);
  const { recommendation, reasons } = generateRecommendation(
    riskScore, violations, available, working_days
  );

  const result: AnalysisResult = {
    request: { 
      id: 'NEW', 
      employee_id, 
      leave_type: leave_type as LeaveType, 
      start_date, 
      end_date, 
      working_days, 
      reason, 
      status: 'pending', 
      submitted_at: new Date().toISOString() 
    },
    employee,
    balance: { ...balance, available_days: available },
    conflicts,
    policyViolations: violations,
    recommendation,
    recommendationReasons: reasons,
    riskScore
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

function calculateWorkingDays(start: string, end: string, holidays: string[]): number {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  
  if (startDate > endDate) return 0;

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.filter(day => {
    const isWknd = isWeekend(day);
    const dateStr = day.toISOString().split('T')[0];
    const isHoliday = holidays.includes(dateStr);
    return !isWknd && !isHoliday;
  }).length;
}

function calculateRiskScore(conflicts: ConflictInfo[], violations: PolicyViolation[], available: number, requested: number): number {
  let score = 0;
  if (available < requested) score += 50;
  score += conflicts.filter(c => c.severity === 'high').length * 20;
  score += conflicts.filter(c => c.severity === 'medium').length * 10;
  score += violations.filter(v => v.blocking).length * 40;
  score += violations.filter(v => !v.blocking).length * 5;
  return Math.min(score, 100);
}

function generateRecommendation(risk: number, violations: PolicyViolation[], available: number, requested: number) {
  const blockingViolation = violations.some(v => v.blocking);
  const insufficientBalance = available < requested;

  if (blockingViolation || insufficientBalance) {
    return {
      recommendation: 'reject' as const,
      reasons: [
        ...(insufficientBalance ? [`Insufficient balance: ${available} days available, ${requested} requested`] : []),
        ...violations.filter(v => v.blocking).map(v => v.description)
      ]
    };
  }
  
  if (risk > 40) {
    return { 
      recommendation: 'review' as const, 
      reasons: ['High risk due to conflicts or policy warnings — manual review recommended'] 
    };
  }
  
  return { recommendation: 'approve' as const, reasons: ['All checks passed'] };
}
