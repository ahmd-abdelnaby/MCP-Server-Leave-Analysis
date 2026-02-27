import mssql from 'mssql';
import { getDbConnection } from '../data/db.js';

export async function teamCalendarResource(uri: string) {
  const pool = await getDbConnection();
  const result = await pool.request()
    .query(`
      SELECT lr.*, e.name, e.department
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status IN ('pending', 'approved')
      AND lr.end_date >= GETDATE()
    `);

  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(result.recordset, null, 2)
    }]
  };
}
