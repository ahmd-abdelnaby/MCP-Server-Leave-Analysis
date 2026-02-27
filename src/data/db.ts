import mssql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '(localdb)\\mssqllocaldb'};Database=${process.env.DB_NAME || 'ELMS_DB'};Trusted_Connection=yes;`,
} as any;

let pool: mssql.ConnectionPool | null = null;

export async function getDbConnection(): Promise<mssql.ConnectionPool> {
  if (pool) return pool;

  try {
    pool = await new mssql.ConnectionPool(config as any).connect();
    console.error('Connected to SQL Server LocalDB');
    return pool;
  } catch (err) {
    console.error('Database connection failed: ', err);
    throw err;
  }
}

export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
