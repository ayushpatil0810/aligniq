import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { roadmap } from '@/db/schema';

const RequestSchema = z.object({
  roadmapId: z.string().min(1),
  progress: z.number().int().min(0).max(100),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { roadmapId, progress } = RequestSchema.parse(body);

    const [updated] = await db
      .update(roadmap)
      .set({ progress })
      .where(and(eq(roadmap.id, roadmapId), eq(roadmap.userId, session.user.id)))
      .returning({ id: roadmap.id });

    if (!updated) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    revalidatePath('/roadmap');
    revalidatePath(`/roadmap/${roadmapId}`);

    return NextResponse.json({ ok: true, progress });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update progress';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
