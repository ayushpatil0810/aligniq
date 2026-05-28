import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get the current session from server components / actions.
 * Returns null if not authenticated.
 */
export async function getSession() {
	return auth.api.getSession({ headers: await headers() });
}

/**
 * Require authentication — redirects to /auth if not logged in.
 * Use in protected server components.
 */
export async function requireAuth() {
	const session = await getSession();
	if (!session) redirect('/auth');
	return session;
}

/**
 * Get the current user ID or throw.
 */
export async function requireUserId(): Promise<string> {
	const session = await requireAuth();
	return session.user.id;
}
