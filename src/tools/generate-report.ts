import mssql from 'mssql';
import { getDbConnection } from '../data/db.js';

export async function generateReportHandler(args: any) {
  const { employee_id, department, year, report_type } = args;
  const targetYear = year || new Date().getFullYear();
  const pool = await getDbConnection();

  if (department) {
    // Department-wide report
    const result = await pool.request()
      .input('department', mssql.NVarChar, department)
      .input('year', mssql.Int, targetYear)
      .query(`
        SELECT e.id, e.name, lb.leave_type, lb.total_days, lb.used_days, lb.pending_days
        FROM employees e
        JOIN leave_balances lb ON e.id = lb.employee_id
        WHERE e.department = @department AND lb.year = @year
      `);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          department,
          year: targetYear,
          report: result.recordset,
          summary: {
            total_employees: new Set(result.recordset.map(r => r.id)).size,
            total_used_days: result.recordset.reduce((acc, r) => acc + r.used_days, 0)
          }
        }, null, 2)
      }]
    };
  }

  // Employee-specific report if no department provided
  if (employee_id) {
    const result = await pool.request()
      .input('employee_id', mssql.NVarChar, employee_id)
      .input('year', mssql.Int, targetYear)
      .query(`
        SELECT * FROM leave_balances WHERE employee_id = @employee_id AND year = @year
      `);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          employee_id,
          year: targetYear,
          balances: result.recordset
        }, null, 2)
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: 'No department or employee_id provided for report.'
    }]
  };
}
