import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = neon(process.env.DATABASE_URL);

// Database query helpers
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    // Neon sql function expects tagged template, convert parameterized query
    if (params && params.length > 0) {
      // Replace $1, $2, etc. with actual values for Neon
      let processedText = text;
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        const value = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
        processedText = processedText.replace(placeholder, String(value));
      });
      const result = await sql(processedText as any) as T[];
      return result;
    } else {
      const result = await sql(text as any) as T[];
      return result;
    }
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
