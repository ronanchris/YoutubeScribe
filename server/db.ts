import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Set up the database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable not found!');
  process.exit(1);
}

// Create a postgres client
const client = postgres(connectionString);

// Create drizzle client
export const db = drizzle(client, { schema });
export const pool = client;