import { db } from '@/server/db';
import { resume } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getResumes(userId: string) {
  return await db
    .select()
    .from(resume)
    .where(eq(resume.userId, userId))
    .orderBy(desc(resume.createdAt))
    .limit(20);
}

export async function getResumeById(userId: string, id: string) {
  const [found] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, id), eq(resume.userId, userId)));
  return found ?? null;
}

export async function createResumeRecord(data: typeof resume.$inferInsert) {
  const id = data.id || nanoid();
  await db.insert(resume).values({ ...data, id });
  return id;
}

export async function updateResumeStatus(id: string, updateData: Partial<typeof resume.$inferInsert>) {
  await db.update(resume).set(updateData).where(eq(resume.id, id));
}

export async function deleteResumeRecord(userId: string, id: string) {
  await db.delete(resume).where(and(eq(resume.id, id), eq(resume.userId, userId)));
}
