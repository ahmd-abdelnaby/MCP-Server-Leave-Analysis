import { getTeamLeaves, getEmployee } from '../data/leaves.js';

export async function checkConflictsHandler(args: any) {
  const { employee_id, start_date, end_date } = args;

  const employee = await getEmployee(employee_id);
  if (!employee) {
    throw new Error(`Employee ${employee_id} not found`);
  }

  const conflicts = await getTeamLeaves(employee.department, start_date, end_date);
  
  // Filter out the requesting employee's own record from conflicts
  const teamConflicts = conflicts.filter(c => c.employee_id !== employee_id);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        department: employee.department,
        overlapping_requests: teamConflicts,
        conflict_count: teamConflicts.length
      }, null, 2)
    }]
  };
}
