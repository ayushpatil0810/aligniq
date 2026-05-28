import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.string().url().optional(),
	NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
	OPENAI_API_KEY: z.string().min(1).optional(),
	AI_BASE_URL: z.string().url().optional(),
	AI_MODEL_NAME: z.string().default('gpt-4o'),
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse({
	DATABASE_URL: process.env.DATABASE_URL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	AI_BASE_URL: process.env.AI_BASE_URL,
	AI_MODEL_NAME: process.env.AI_MODEL_NAME,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!_env.success) {
	console.error('❌ Invalid environment variables:', _env.error.format());
	throw new Error('Invalid environment variables');
}

export const env = _env.data;
export default env;
