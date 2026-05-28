import { db } from '@/server/db';
import { resume, analysisResult, roadmap, jobDescription } from '@/db/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';

export async function getDashboardStats(userId: string) {
	const [resumeCount, analysisCount, activeRoadmap] = await Promise.all([
		db.select({ count: count() }).from(resume).where(eq(resume.userId, userId)),
		db.select({ count: count() }).from(analysisResult).where(eq(analysisResult.userId, userId)),
		db
			.select()
			.from(roadmap)
			.where(eq(roadmap.userId, userId))
			.orderBy(desc(roadmap.createdAt))
			.limit(1),
	]);

	return {
		totalResumes: resumeCount[0]?.count ?? 0,
		totalAnalyses: analysisCount[0]?.count ?? 0,
		latestRoadmap: activeRoadmap[0] ?? null,
	};
}

export async function getRecentAnalysesWithJobs(userId: string) {
	const recentAnalyses = await db
		.select({
			id: analysisResult.id,
			matchScore: analysisResult.matchScore,
			readinessLevel: analysisResult.readinessLevel,
			status: analysisResult.status,
			createdAt: analysisResult.createdAt,
			jobId: analysisResult.jobId,
		})
		.from(analysisResult)
		.where(eq(analysisResult.userId, userId))
		.orderBy(desc(analysisResult.createdAt))
		.limit(5);

	if (recentAnalyses.length === 0) {
		return [];
	}

	const jobIds = [...new Set(recentAnalyses.map((a) => a.jobId))];

	const jobs = await db
		.select({ id: jobDescription.id, title: jobDescription.title })
		.from(jobDescription)
		.where(inArray(jobDescription.id, jobIds));

	const jobMap = new Map(jobs.map((j) => [j.id, j]));

	return recentAnalyses.map((a) => ({
		...a,
		job: jobMap.get(a.jobId) ?? null,
	}));
}
