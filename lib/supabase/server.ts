import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key.
 * Use ONLY in server components, API routes, and server actions.
 * NEVER expose the service role key to the client.
 */
export function createAdminClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !key) {
		throw new Error('Supabase URL or Service Role Key is missing from environment variables');
	}

	return createSupabaseClient(url, key, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
