import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Set up the database connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable not found!');
  process.exit(1);
}

export const pool = new Pool({ connectionString });

// Create drizzle client
export const db = drizzle(pool, { schema });