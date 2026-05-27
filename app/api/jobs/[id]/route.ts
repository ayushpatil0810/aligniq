import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { jobDescription } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [job] = await db
      .select()
      .from(jobDescription)
      .where(eq(jobDescription.id, id));

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
