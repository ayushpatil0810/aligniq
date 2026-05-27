import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { analysisResult } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/analysis/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [analysis] = await db
      .select()
      .from(analysisResult)
      .where(and(eq(analysisResult.id, id), eq(analysisResult.userId, session.user.id)));

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analysis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
