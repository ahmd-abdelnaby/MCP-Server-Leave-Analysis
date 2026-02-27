import mssql from 'mssql';
import { getDbConnection } from '../data/db.js';

export async function leavePolicyResource(uri: string) {
  const pool = await getDbConnection();
  const result = await pool.request()
    .query('SELECT * FROM leave_policies');

  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(result.recordset, null, 2)
    }]
  };
}
