import { getLeaveBalance } from '../data/balances.js';
import { LeaveType } from '../types/index.js';

export async function checkBalanceHandler(args: any) {
  const { employee_id, leave_type, year } = args;
  
  const targetYear = year || new Date().getFullYear();
  const type = (leave_type as LeaveType) || 'annual';

  const balance = await getLeaveBalance(employee_id, type, targetYear);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(balance, null, 2)
    }]
  };
}
