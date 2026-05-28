import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

// Lazy singleton pattern — avoids build-time initialization errors
const globalForDb = globalThis as unknown as { db: DbClient | undefined };

function createDb(): DbClient {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL environment variable is not set');
	const sql = neon(url);
	return drizzle(sql, { schema });
}

export const db: DbClient = new Proxy({} as DbClient, {
	get(_target, prop) {
		if (!globalForDb.db) {
			globalForDb.db = createDb();
		}
		return globalForDb.db[prop as keyof DbClient];
	},
});
