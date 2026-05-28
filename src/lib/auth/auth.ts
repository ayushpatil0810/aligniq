import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';
import * as schema from '@/db/schema/auth-schema';
import { env } from '@/lib/utils/env';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	baseURL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	emailAndPassword: { enabled: true },
});
