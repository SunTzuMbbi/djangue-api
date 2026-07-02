import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const isInternal = connectionString.includes('railway.internal');

const client = postgres(connectionString, {
  ssl: isInternal ? false : 'require',
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 10,
  max: 5,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });
