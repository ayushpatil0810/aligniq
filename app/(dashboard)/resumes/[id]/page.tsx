import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume, jobDescription } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ResumeAnalyzeClient } from '@/features/resume/components/ResumeAnalyzeClient';
import { FileText, Star, Code, Brain } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import type { ParsedResume } from '@/ai/schemas/resume-analysis';

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  const [found] = await db
    .select()
    .from(resume)
    .where(eq(resume.id, id));

  if (!found || found.userId !== session.user.id) notFound();

  const jobs = await db
    .select({ id: jobDescription.id, title: jobDescription.title, company: jobDescription.company, level: jobDescription.level, category: jobDescription.category })
    .from(jobDescription)
    .where(eq(jobDescription.isActive, true))
    .orderBy(desc(jobDescription.createdAt))
    .limit(50);

  const parsed = found.parsedData as ParsedResume | null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={found.fileName}
        description={parsed
          ? `${parsed.experienceLevel} · ${parsed.yearsOfExperience} year${parsed.yearsOfExperience !== 1 ? 's' : ''} experience · Score: ${found.score}/100`
          : 'Resume parsed and ready for analysis'}
      />

      {parsed && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Skills */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Code size={16} weight="duotone" className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Technical Skills</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.technicalSkills.slice(0, 20).map((skill) => (
                <span key={skill} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Brain size={16} weight="duotone" className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
            </div>
            <ul className="space-y-2">
              {parsed.insights.slice(0, 4).map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Star size={12} weight="fill" className="mt-0.5 shrink-0 text-primary/60" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Concepts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={16} weight="duotone" className="text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Missing Concepts</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.missingConcepts.slice(0, 12).map((concept) => (
                <span key={concept} className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analyze Against Job */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Run Gap Analysis</h2>
        <p className="mb-5 text-xs text-muted-foreground">
          Select a job description to perform a semantic AI match analysis.
        </p>
        <ResumeAnalyzeClient resumeId={found.id} jobs={jobs} />
      </div>
    </div>
  );
}
