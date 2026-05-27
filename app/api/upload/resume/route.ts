import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume } from '@/db/schema';
import { uploadResume } from '@/lib/supabase/storage';
import { extractTextFromPDF } from '@/lib/pdf/extractor';
import { parseResume } from '@/ai/pipelines/parse-resume';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Supabase storage
    const { path, url } = await uploadResume(userId, file);

    // Create DB record
    const resumeId = nanoid();
    await db.insert(resume).values({
      id: resumeId,
      userId,
      fileName: file.name,
      fileUrl: url,
      storagePath: path,
      status: 'processing',
    });

    let rawText = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      rawText = await extractTextFromPDF(buffer);
    } catch (err) {
      console.error('PDF extraction error:', err);
      await db.update(resume).set({ status: 'failed' }).where(eq(resume.id, resumeId));
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 422 });
    }

    // Parse resume with AI
    let parsedData = null;
    let score = null;
    try {
      const parsed = await parseResume(rawText);
      parsedData = parsed;
      score = parsed.score;
    } catch (err) {
      console.error('AI parsing error:', err);
      // Proceed with raw text only
    }

    // Update record with parsed data
    await db
      .update(resume)
      .set({
        rawText,
        parsedData,
        score,
        status: 'done',
      })
      .where(eq(resume.id, resumeId));

    return NextResponse.json({
      id: resumeId,
      fileName: file.name,
      score,
      status: 'done',
    });
  } catch (err) {
    console.error('Upload route error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
