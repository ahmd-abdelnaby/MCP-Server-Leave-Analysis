import fs from 'fs';
import path from 'path';
import { getDbConnection, closeDbConnection } from '../src/data/db.js';
import mssql from 'mssql';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const pool = await getDbConnection();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // SQL Server cannot execute multiple statements separated by -- in one batch 
  // without GO if using some drivers, but mssql-node can if we split or use simple batches.
  // For schema, we'll try executing it in parts if needed.
  
  console.log('Applying schema...');
  // Split the schema by GO or just execute if simple enough.
  // Our schema is simple enough but let's be safe and split by IF NOT EXISTS logic
  // if it fails. For now, we'll try as one big batch.
  try {
      await pool.request().batch(schemaSql);
      console.log('Schema applied successfully.');

      console.log('Seeding initial data...');
      
      const seedSql = `
      -- EMPLOYEES
      IF NOT EXISTS (SELECT * FROM employees WHERE id = 'EMP001')
      BEGIN
          INSERT INTO employees (id, name, department, manager_id, annual_leave_days, sick_leave_days, join_date)
          VALUES ('MGR001', 'Khalid Al-Farsi', 'Engineering', NULL, 25, 14, '2019-06-01');

          INSERT INTO employees (id, name, department, manager_id, annual_leave_days, sick_leave_days, join_date)
          VALUES ('EMP001', 'Ahmed Al-Rashid', 'Engineering', 'MGR001', 21, 14, '2022-03-01');

          INSERT INTO employees (id, name, department, manager_id, annual_leave_days, sick_leave_days, join_date)
          VALUES ('EMP002', 'Sara Al-Mutairi', 'Engineering', 'MGR001', 21, 14, '2023-01-15');
      END

      -- LEAVE BALANCES
      IF NOT EXISTS (SELECT * FROM leave_balances WHERE employee_id = 'EMP001' AND year = 2025)
      BEGIN
          INSERT INTO leave_balances (employee_id, leave_type, year, total_days, used_days, pending_days)
          VALUES ('EMP001', 'annual', 2025, 21, 8, 0),
                 ('EMP001', 'sick',   2025, 14, 2, 0),
                 ('EMP002', 'annual', 2025, 21, 5, 3);
      END

      -- PUBLIC HOLIDAYS
      IF NOT EXISTS (SELECT * FROM public_holidays WHERE country = 'SA')
      BEGIN
          INSERT INTO public_holidays (holiday_date, name, country)
          VALUES ('2025-01-01', 'New Year', 'SA'),
                 ('2025-04-23', 'Founding Day', 'SA'),
                 ('2025-09-23', 'National Day', 'SA');
      END
      `;
      
      await pool.request().batch(seedSql);
      console.log('Seeding completed successfully.');
  } catch (err) {
      console.error('Error during seeding:', err);
  } finally {
      await closeDbConnection();
  }
}

seed();
