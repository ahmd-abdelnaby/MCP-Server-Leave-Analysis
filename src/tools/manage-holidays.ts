import mssql from 'mssql/msnodesqlv8.js';
import { getDbConnection } from '../data/db.js';

export async function manageHolidaysHandler(args: any) {
  const { action, holiday_date, name, country = 'SA' } = args;
  const pool = await getDbConnection();

  if (action === 'list') {
    const result = await pool.request()
      .input('country', mssql.NVarChar, country)
      .query('SELECT holiday_date, name FROM public_holidays WHERE country = @country ORDER BY holiday_date');
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result.recordset.map(r => ({
          date: r.holiday_date.toISOString().split('T')[0],
          name: r.name
        })), null, 2)
      }]
    };
  }

  if (action === 'add') {
    if (!name) throw new Error("Holiday name is required for 'add' action.");
    
    await pool.request()
      .input('date', mssql.Date, holiday_date)
      .input('name', mssql.NVarChar, name)
      .input('country', mssql.NVarChar, country)
      .query(`
        IF NOT EXISTS (SELECT * FROM public_holidays WHERE holiday_date = @date AND country = @country)
        INSERT INTO public_holidays (holiday_date, name, country) VALUES (@date, @name, @country)
        ELSE
        UPDATE public_holidays SET name = @name WHERE holiday_date = @date AND country = @country
      `);

    return {
      content: [{
        type: 'text',
        text: `Successfully added/updated holiday: ${name} on ${holiday_date}`
      }]
    };
  } 
  
  if (action === 'delete') {
    await pool.request()
      .input('date', mssql.Date, holiday_date)
      .input('country', mssql.NVarChar, country)
      .query('DELETE FROM public_holidays WHERE holiday_date = @date AND country = @country');

    return {
      content: [{
        type: 'text',
        text: `Successfully deleted holiday on ${holiday_date}`
      }]
    };
  }

  throw new Error(`Unknown action: ${action}`);
}
