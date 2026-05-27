import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { roadmap } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { RoadmapClient } from '@/features/roadmap/components/RoadmapClient';
import type { RoadmapWeek } from '@/ai/schemas/roadmap';

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  const [found] = await db
    .select()
    .from(roadmap)
    .where(and(eq(roadmap.id, id), eq(roadmap.userId, session.user.id)));

  if (!found) notFound();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Your Learning Roadmap"
        description={`4-week personalized plan · Week ${found.currentWeek} of 4 · ${found.progress}% complete`}
      />
      <RoadmapClient roadmapId={found.id} weeks={found.weeks as RoadmapWeek[]} initialWeek={found.currentWeek} initialProgress={found.progress} />
    </div>
  );
}
