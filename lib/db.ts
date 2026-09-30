import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = neon(process.env.DATABASE_URL);

// Database query helpers using sql.query() for parameterized queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    // Use sql.query() method for queries with $1, $2 placeholders
    const result = await sql.query(text, params || []) as T[];
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (sql: typeof query) => Promise<T>
): Promise<T> {
  // Note: Neon serverless doesn't support traditional transactions
  // For production, consider using Prisma or Drizzle ORM
  return callback(query);
}
