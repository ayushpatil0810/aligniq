import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { requireAuth } from '@/server/auth';
import { analyzeMatch } from '@/ai/pipelines/match-analysis';
import { ParsedResumeSchema } from '@/ai/schemas/resume-analysis';
import { z } from 'zod';
import { getResumeById } from '@/data-access/resume';
import {
	getAnalyses,
	getJobById,
	createAnalysisRecord,
	updateAnalysisResult,
	createCustomJob,
} from '@/data-access/analysis';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z
	.object({
		resumeId: z.string().min(1),
		jobId: z.string().optional(),
		customJob: z
			.object({
				title: z.string().min(1),
				description: z.string().min(10),
			})
			.optional(),
	})
	.refine((data) => data.jobId || data.customJob, {
		message: 'Either jobId or customJob is required',
	});

// POST /api/analysis — trigger a new analysis
export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth();
		const userId = session.user.id;

		const body = await req.json();
		const { resumeId, jobId, customJob } = RequestSchema.parse(body);

		// Verify resume belongs to user
		const resumeRecord = await getResumeById(userId, resumeId);

		if (!resumeRecord) {
			return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
		}

		if (resumeRecord.status !== 'done' || !resumeRecord.parsedData) {
			return NextResponse.json({ error: 'Resume is not fully processed yet' }, { status: 422 });
		}

		// Validate parsedData using Zod instead of type casting
		const parsedResult = ParsedResumeSchema.safeParse(resumeRecord.parsedData);
		if (!parsedResult.success) {
			return NextResponse.json({ error: 'Resume data is malformed' }, { status: 500 });
		}

		let finalJobId = jobId;

		if (customJob) {
			finalJobId = await createCustomJob(userId, customJob.title, customJob.description);
		}

		// Fetch job
		const jobRecord = await getJobById(finalJobId!);

		if (!jobRecord) {
			return NextResponse.json({ error: 'Job not found' }, { status: 404 });
		}

		// Create analysis record
		const analysisId = await createAnalysisRecord({
			userId,
			resumeId,
			jobId: finalJobId!,
			status: 'processing',
		});

		// Run AI analysis in the background
		after(async () => {
			try {
				const analysis = await analyzeMatch({
					parsedResume: parsedResult.data,
					jobDescription: jobRecord,
				});

				// Update with results
				await updateAnalysisResult(analysisId, {
					matchScore: analysis.matchScore,
					skillsMatched: analysis.skillsMatched,
					skillsMissing: analysis.skillsMissing,
					strengths: analysis.strengths,
					weaknesses: analysis.weaknesses,
					insights: analysis.insights,
					readinessLevel: analysis.readinessLevel,
					status: 'done',
				});
			} catch (err) {
				console.error('Background analysis error:', err);
				await updateAnalysisResult(analysisId, { status: 'failed' });
			}
		});

		return NextResponse.json({ id: analysisId, status: 'processing' }, { status: 202 });
	} catch (err) {
		console.error('Analysis route error:', err);
		const message = err instanceof Error ? err.message : 'Analysis failed';
		const status = message.includes('parse') ? 400 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

// GET /api/analysis — list user's analyses
export async function GET() {
	try {
		const session = await requireAuth();

		const analyses = await getAnalyses(session.user.id);

		return NextResponse.json({ analyses });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch analyses';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
