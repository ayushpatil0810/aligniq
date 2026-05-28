import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { analysisResult, resume, jobDescription, interviewQuestion } from '@/db/schema';
import { generateInterviewQuestions } from '@/ai/pipelines/interview-generator';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z.object({ analysisId: z.string().min(1) });

// POST /api/interview
export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth();
		const userId = session.user.id;

		const body = await req.json();
		const { analysisId } = RequestSchema.parse(body);

		const [analysis] = await db
			.select()
			.from(analysisResult)
			.where(and(eq(analysisResult.id, analysisId), eq(analysisResult.userId, userId)));

		if (!analysis || analysis.status !== 'done') {
			return NextResponse.json({ error: 'Analysis not ready' }, { status: 404 });
		}

		const [resumeRecord] = await db.select().from(resume).where(eq(resume.id, analysis.resumeId));

		const [job] = await db
			.select()
			.from(jobDescription)
			.where(eq(jobDescription.id, analysis.jobId));

		if (!resumeRecord?.parsedData || !job) {
			return NextResponse.json({ error: 'Required data not found' }, { status: 404 });
		}

		const interviewSet = await generateInterviewQuestions({
			parsedResume: resumeRecord.parsedData as Parameters<
				typeof generateInterviewQuestions
			>[0]['parsedResume'],
			analysis: {
				matchScore: analysis.matchScore ?? 0,
				skillsMatched:
					(analysis.skillsMatched as Parameters<
						typeof generateInterviewQuestions
					>[0]['analysis']['skillsMatched']) ?? [],
				skillsMissing:
					(analysis.skillsMissing as Parameters<
						typeof generateInterviewQuestions
					>[0]['analysis']['skillsMissing']) ?? [],
				strengths: (analysis.strengths as string[]) ?? [],
				weaknesses: (analysis.weaknesses as string[]) ?? [],
				insights: analysis.insights ?? '',
				readinessLevel: analysis.readinessLevel ?? 'developing',
				placementProbability: analysis.matchScore ?? 0,
			},
			jobDescription: job,
		});

		const questionId = nanoid();
		await db.insert(interviewQuestion).values({
			id: questionId,
			analysisId,
			userId,
			questions: interviewSet.questions,
		});

		return NextResponse.json({ id: questionId, questions: interviewSet.questions });
	} catch (err) {
		console.error('Interview route error:', err);
		const message = err instanceof Error ? err.message : 'Interview generation failed';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

// GET /api/interview?analysisId=...
export async function GET(req: NextRequest) {
	try {
		const session = await requireAuth();
		const { searchParams } = new URL(req.url);
		const analysisId = searchParams.get('analysisId');

		if (!analysisId) {
			return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
		}

		const [found] = await db
			.select()
			.from(interviewQuestion)
			.where(
				and(
					eq(interviewQuestion.analysisId, analysisId),
					eq(interviewQuestion.userId, session.user.id)
				)
			);

		return NextResponse.json({ questions: found ?? null });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch questions';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
