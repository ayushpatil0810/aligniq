import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { getResumes } from '@/data-access/resume';

export const runtime = 'nodejs';

// GET /api/resumes — list user's resumes
export async function GET() {
  try {
    const session = await requireAuth();
    const resumes = await getResumes(session.user.id);
    return NextResponse.json({ resumes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch resumes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
