import mssql from 'mssql';
import { getDbConnection } from './db.js';
import { LeaveRequest, Employee } from '../types/index.js';

export async function getTeamLeaves(
  department: string,
  start_date: string,
  end_date: string
): Promise<LeaveRequest[]> {
  const pool = await getDbConnection();
  const result = await pool.request()
    .input('department', mssql.NVarChar, department)
    .input('start_date', mssql.Date, start_date)
    .input('end_date', mssql.Date, end_date)
    .query(`
      SELECT lr.* 
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE e.department = @department
      AND (
          (lr.start_date <= @end_date AND lr.end_date >= @start_date)
      )
      AND lr.status IN ('pending', 'approved')
    `);

  return result.recordset.map(row => ({
    id: row.id,
    employee_id: row.employee_id,
    leave_type: row.leave_type,
    start_date: row.start_date.toISOString().split('T')[0],
    end_date: row.end_date.toISOString().split('T')[0],
    working_days: row.working_days,
    reason: row.reason,
    status: row.status,
    submitted_at: row.submitted_at.toISOString()
  }));
}

export async function getEmployee(employee_id: string): Promise<Employee | null> {
  const pool = await getDbConnection();
  const result = await pool.request()
    .input('id', mssql.NVarChar, employee_id)
    .query('SELECT * FROM employees WHERE id = @id');

  if (result.recordset.length === 0) return null;

  const row = result.recordset[0];
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    manager_id: row.manager_id,
    annual_leave_days: row.annual_leave_days,
    sick_leave_days: row.sick_leave_days,
    join_date: row.join_date.toISOString().split('T')[0]
  };
}

export async function getPublicHolidays(country: string = 'SA'): Promise<string[]> {
  const pool = await getDbConnection();
  const result = await pool.request()
    .input('country', mssql.NVarChar, country)
    .query('SELECT holiday_date FROM public_holidays WHERE country = @country');

  return result.recordset.map(row => row.holiday_date.toISOString().split('T')[0]);
}
