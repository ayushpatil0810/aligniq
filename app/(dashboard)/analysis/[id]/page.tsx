import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { analysisResult, resume, jobDescription, roadmap, interviewQuestion } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { AnalysisClient } from '@/features/analysis/components/AnalysisClient';
import type { AnalysisResult } from '@/db/schema';

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await requireAuth();
	const { id } = await params;

	const [analysis] = await db
		.select()
		.from(analysisResult)
		.where(and(eq(analysisResult.id, id), eq(analysisResult.userId, session.user.id)));

	if (!analysis) notFound();

	const [[resumeRecord], [job], [existingRoadmap], [existingInterview]] = await Promise.all([
		db.select({ fileName: resume.fileName }).from(resume).where(eq(resume.id, analysis.resumeId)),
		db
			.select({
				title: jobDescription.title,
				company: jobDescription.company,
				level: jobDescription.level,
			})
			.from(jobDescription)
			.where(eq(jobDescription.id, analysis.jobId)),
		db.select({ id: roadmap.id }).from(roadmap).where(eq(roadmap.analysisId, id)),
		db
			.select({ id: interviewQuestion.id })
			.from(interviewQuestion)
			.where(eq(interviewQuestion.analysisId, id)),
	]);

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader
				title={`${job?.title ?? 'Analysis'} at ${job?.company ?? ''}`}
				description={`Resume: ${resumeRecord?.fileName ?? 'Unknown'} · ${job?.level ?? ''} level`}
			/>
			<AnalysisClient
				analysis={analysis}
				hasRoadmap={!!existingRoadmap}
				hasInterview={!!existingInterview}
				roadmapId={existingRoadmap?.id}
				interviewId={existingInterview?.id}
			/>
		</div>
	);
}
