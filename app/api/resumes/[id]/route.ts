import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteResume } from '@/lib/supabase/storage';

export const runtime = 'nodejs';

// GET /api/resumes/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [found] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)));

    if (!found) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ resume: found });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/resumes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [found] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)));

    if (!found) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Delete from Supabase storage
    await deleteResume(found.storagePath);

    // Delete DB record (cascades to analyses)
    await db.delete(resume).where(eq(resume.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
