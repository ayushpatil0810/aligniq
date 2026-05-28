import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { analysisResult, resume, jobDescription, roadmap } from '@/db/schema';
import { generateRoadmap } from '@/ai/pipelines/roadmap-generator';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z.object({ analysisId: z.string().min(1) });

// POST /api/roadmap
export async function POST(req: NextRequest) {
	try {
		const session = await requireAuth();
		const userId = session.user.id;

		const body = await req.json();
		const { analysisId } = RequestSchema.parse(body);

		// Fetch analysis
		const [analysis] = await db
			.select()
			.from(analysisResult)
			.where(and(eq(analysisResult.id, analysisId), eq(analysisResult.userId, userId)));

		if (!analysis || analysis.status !== 'done') {
			return NextResponse.json({ error: 'Analysis not ready' }, { status: 404 });
		}

		// Fetch job
		const [job] = await db
			.select()
			.from(jobDescription)
			.where(eq(jobDescription.id, analysis.jobId));

		if (!job) {
			return NextResponse.json({ error: 'Job not found' }, { status: 404 });
		}

		// Extract AI settings from headers
		const aiConfig = {
			apiKey: req.headers.get('x-ai-api-key') || null,
			baseUrl: req.headers.get('x-ai-base-url') || null,
			modelName: req.headers.get('x-ai-model-name') || null,
		};

		// Generate roadmap
		const roadmapData = await generateRoadmap({
			aiConfig,
			analysis: {
				matchScore: analysis.matchScore ?? 0,
				skillsMatched:
					(analysis.skillsMatched as Parameters<
						typeof generateRoadmap
					>[0]['analysis']['skillsMatched']) ?? [],
				skillsMissing:
					(analysis.skillsMissing as Parameters<
						typeof generateRoadmap
					>[0]['analysis']['skillsMissing']) ?? [],
				strengths: (analysis.strengths as string[]) ?? [],
				weaknesses: (analysis.weaknesses as string[]) ?? [],
				insights: analysis.insights ?? '',
				readinessLevel: analysis.readinessLevel ?? 'developing',
				placementProbability: analysis.matchScore ?? 0,
			},
			jobDescription: job,
		});

		const roadmapId = nanoid();
		await db.insert(roadmap).values({
			id: roadmapId,
			analysisId,
			userId,
			weeks: roadmapData.weeks,
			currentWeek: 1,
			progress: 0,
		});

		return NextResponse.json({ id: roadmapId, weeks: roadmapData.weeks });
	} catch (err) {
		console.error('Roadmap route error:', err);
		const message = err instanceof Error ? err.message : 'Roadmap generation failed';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

// GET /api/roadmap?analysisId=...
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
			.from(roadmap)
			.where(and(eq(roadmap.analysisId, analysisId), eq(roadmap.userId, session.user.id)));

		if (!found) {
			return NextResponse.json({ roadmap: null });
		}

		return NextResponse.json({ roadmap: found });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch roadmap';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
