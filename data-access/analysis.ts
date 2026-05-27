import { db } from '@/server/db';
import { analysisResult, jobDescription } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getAnalyses(userId: string) {
  return await db
    .select({
      id: analysisResult.id,
      resumeId: analysisResult.resumeId,
      jobId: analysisResult.jobId,
      matchScore: analysisResult.matchScore,
      readinessLevel: analysisResult.readinessLevel,
      status: analysisResult.status,
      createdAt: analysisResult.createdAt,
    })
    .from(analysisResult)
    .where(eq(analysisResult.userId, userId))
    .orderBy(desc(analysisResult.createdAt))
    .limit(20);
}

export async function getAnalysisById(userId: string, id: string) {
  const [analysis] = await db
    .select()
    .from(analysisResult)
    .where(and(eq(analysisResult.id, id), eq(analysisResult.userId, userId)));
  return analysis ?? null;
}

export async function createAnalysisRecord(data: typeof analysisResult.$inferInsert) {
  const id = data.id || nanoid();
  await db.insert(analysisResult).values({ ...data, id });
  return id;
}

export async function updateAnalysisResult(id: string, updateData: Partial<typeof analysisResult.$inferInsert>) {
  await db.update(analysisResult).set(updateData).where(eq(analysisResult.id, id));
}

export async function getJobById(id: string) {
  const [job] = await db.select().from(jobDescription).where(eq(jobDescription.id, id));
  return job ?? null;
}
