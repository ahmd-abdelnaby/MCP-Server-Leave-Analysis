import { differenceInBusinessDays, parseISO, differenceInMonths, isWithinInterval } from 'date-fns';
import { Employee, LeaveType, PolicyViolation } from '../types/index.js';

export async function validatePolicyHandler(args: any) {
  const { employee, leave_type, start_date, end_date, reason, working_days, available } = args;
  
  const violations = validatePolicies({
    employee,
    leave_type,
    start_date,
    end_date,
    reason,
    working_days,
    available
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(violations, null, 2)
    }]
  };
}

export function validatePolicies(data: {
  employee: Employee;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
  working_days: number;
  available: number;
}): PolicyViolation[] {
  const { employee, leave_type, start_date, end_date, reason, working_days, available } = data;
  const violations: PolicyViolation[] = [];

  const now = new Date();
  const start = parseISO(start_date);
  const join = parseISO(employee.join_date);

  // 1. Minimum Notice (3 days for annual)
  if (leave_type === 'annual') {
    const noticeDays = differenceInBusinessDays(start, now);
    if (noticeDays < 3) {
      violations.push({
        rule: 'min_notice',
        description: 'Annual leave requires 3 working days advance notice',
        blocking: false
      });
    }
  }

  // 2. Probation check (3 months for annual)
  if (leave_type === 'annual') {
    const months = differenceInMonths(now, join);
    if (months < 3) {
      violations.push({
        rule: 'probation_block',
        description: 'Employees on probation (< 3 months) cannot take annual leave',
        blocking: true
      });
    }
  }

  // 3. Max consecutive days (15 for annual)
  if (leave_type === 'annual' && working_days > 15) {
    violations.push({
      rule: 'max_consecutive',
      description: 'Maximum 15 consecutive working days per request',
      blocking: true
    });
  }

  // 4. Sick leave medical certificate (> 2 days)
  if (leave_type === 'sick' && working_days > 2 && !reason) {
    violations.push({
      rule: 'sick_note_required',
      description: 'Medical certificate/reason required for sick leave > 2 days',
      blocking: false
    });
  }

  // 5. Year-end blackout (Dec 28 - Jan 2)
  if (leave_type === 'annual') {
    const isBlackout = (date: Date) => {
      const month = date.getMonth(); // 0-indexed
      const day = date.getDate();
      return (month === 11 && day >= 28) || (month === 0 && day <= 2);
    };

    if (isBlackout(start) || isBlackout(parseISO(end_date))) {
      violations.push({
        rule: 'year_end_blackout',
        description: 'Leave not permitted during year-end closing (Dec 28 - Jan 2)',
        blocking: true
      });
    }
  }

  // 6. Insufficient Balance
  if (available < working_days) {
      violations.push({
          rule: 'insufficient_balance',
          description: `Insufficient balance: ${available} days available, ${working_days} requested`,
          blocking: true
      });
  }

  return violations;
}
