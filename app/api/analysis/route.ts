import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume, jobDescription, analysisResult } from '@/db/schema';
import { analyzeMatch } from '@/ai/pipelines/match-analysis';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z.object({
  resumeId: z.string().min(1),
  jobId: z.string().min(1),
});

// POST /api/analysis — trigger a new analysis
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await req.json();
    const { resumeId, jobId } = RequestSchema.parse(body);

    // Verify resume belongs to user
    const [resumeRecord] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)));

    if (!resumeRecord) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resumeRecord.status !== 'done' || !resumeRecord.parsedData) {
      return NextResponse.json({ error: 'Resume is not fully processed yet' }, { status: 422 });
    }

    // Fetch job
    const [jobRecord] = await db
      .select()
      .from(jobDescription)
      .where(eq(jobDescription.id, jobId));

    if (!jobRecord) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Create analysis record
    const analysisId = nanoid();
    await db.insert(analysisResult).values({
      id: analysisId,
      userId,
      resumeId,
      jobId,
      status: 'processing',
    });

    // Run AI analysis
    const analysis = await analyzeMatch({
      parsedResume: resumeRecord.parsedData as Parameters<typeof analyzeMatch>[0]['parsedResume'],
      jobDescription: jobRecord,
    });

    // Update with results
    await db
      .update(analysisResult)
      .set({
        matchScore: analysis.matchScore,
        skillsMatched: analysis.skillsMatched,
        skillsMissing: analysis.skillsMissing,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        insights: analysis.insights,
        readinessLevel: analysis.readinessLevel,
        status: 'done',
      })
      .where(eq(analysisResult.id, analysisId));

    return NextResponse.json({ id: analysisId, matchScore: analysis.matchScore });
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

    const analyses = await db
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
      .where(eq(analysisResult.userId, session.user.id))
      .orderBy(desc(analysisResult.createdAt))
      .limit(20);

    return NextResponse.json({ analyses });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analyses';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
