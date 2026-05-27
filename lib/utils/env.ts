const DATABASE_URL = process.env.DATABASE_URL as string;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET as string;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL as string;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const AI_BASE_URL = process.env.AI_BASE_URL as string;
const AI_MODEL_NAME = process.env.AI_MODEL_NAME as string;

function requireEnv(name: string, value: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  DATABASE_URL: requireEnv('DATABASE_URL', DATABASE_URL),
  BETTER_AUTH_SECRET: requireEnv('BETTER_AUTH_SECRET', BETTER_AUTH_SECRET),
  BETTER_AUTH_URL: requireEnv('BETTER_AUTH_URL', BETTER_AUTH_URL),
  GITHUB_CLIENT_ID: GITHUB_CLIENT_ID ?? '',
  GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET ?? '',
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ?? '',
  NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ?? '',
  OPENAI_API_KEY: OPENAI_API_KEY ?? '',
  AI_BASE_URL: AI_BASE_URL ?? '',
  AI_MODEL_NAME: AI_MODEL_NAME || 'gpt-4o', // Default to gpt-4o if not provided
};

export default env;
