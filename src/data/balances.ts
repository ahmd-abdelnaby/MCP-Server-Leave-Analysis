import mssql from 'mssql';
import { getDbConnection } from './db.js';
import { LeaveBalance, LeaveType } from '../types/index.js';

export async function getLeaveBalance(
  employee_id: string,
  leave_type: LeaveType,
  year: number
): Promise<LeaveBalance> {
  const pool = await getDbConnection();
  const result = await pool.request()
    .input('employee_id', mssql.NVarChar, employee_id)
    .input('leave_type', mssql.NVarChar, leave_type)
    .input('year', mssql.Int, year)
    .query(`
      SELECT employee_id, leave_type, year, total_days, used_days, pending_days
      FROM leave_balances
      WHERE employee_id = @employee_id 
      AND leave_type = @leave_type 
      AND year = @year
    `);

  if (result.recordset.length === 0) {
    // If no specific balance record, we assume zero or default.
    // For annual leave, we might want to fetch employee defaults.
    return {
      employee_id,
      leave_type,
      year,
      total_days: 0,
      used_days: 0,
      pending_days: 0,
      available_days: 0
    };
  }

  const row = result.recordset[0];
  return {
    employee_id: row.employee_id,
    leave_type: row.leave_type as LeaveType,
    year: row.year,
    total_days: row.total_days,
    used_days: row.used_days,
    pending_days: row.pending_days,
    available_days: row.total_days - row.used_days - row.pending_days
  };
}
