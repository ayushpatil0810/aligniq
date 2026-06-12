import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';
import * as schema from '@/db/schema/auth-schema';
import { env } from '@/lib/utils/env';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [
		'https://aligniq-seven.vercel.app',
		...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
		...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
	],
	emailAndPassword: { enabled: true },
});
