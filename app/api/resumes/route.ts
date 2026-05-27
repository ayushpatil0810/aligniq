import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/resumes — list user's resumes
export async function GET() {
  try {
    const session = await requireAuth();

    const resumes = await db
      .select()
      .from(resume)
      .where(eq(resume.userId, session.user.id))
      .orderBy(desc(resume.createdAt))
      .limit(20);

    return NextResponse.json({ resumes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch resumes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
