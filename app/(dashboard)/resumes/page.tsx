import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ResumeUploader } from '@/features/resume/components/ResumeUploader';
import { DeleteResumeButton } from '@/features/resume/components/DeleteResumeButton';
import { FileText, ChartBar, CheckCircle, Clock, XCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Resume } from '@/db/schema';

const statusConfig: Record<string, { icon: React.ElementType; label: string; }> = {
  done: { icon: CheckCircle, label: 'Parsed' },
  processing: { icon: Clock, label: 'Processing' },
  pending: { icon: Clock, label: 'Pending' },
  failed: { icon: XCircle, label: 'Failed' },
};

import { Badge } from '@/components/ui/badge';

function ResumeCard({ resume: r }: { resume: Resume }) {
  const status = statusConfig[r.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const parsedData = r.parsedData as { experienceLevel?: string; technicalSkills?: string[] } | null;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card transition-all hover:border-foreground/30 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground border">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground tracking-tight truncate">{r.fileName}</p>
          <div className="mt-2 flex items-center flex-wrap gap-2">
            <Badge variant="secondary" className={cn("gap-1.5 font-medium", r.status === 'done' ? 'bg-foreground text-background hover:bg-foreground/90' : '')}>
              <StatusIcon size={14} weight={r.status === 'done' ? "fill" : "regular"} />
              {status.label}
            </Badge>
            {parsedData?.experienceLevel && (
              <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] tracking-wider bg-transparent">
                {parsedData.experienceLevel}
              </Badge>
            )}
            {parsedData?.technicalSkills && (
              <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] tracking-wider bg-transparent">
                {parsedData.technicalSkills.length} SKILLS
              </Badge>
            )}
            <span className="text-muted-foreground text-xs pl-2 border-l border-border/50">
               {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 mt-4 sm:mt-0 bg-background/50 p-1.5 rounded-lg border">
        {r.score !== null && (
          <div className="flex flex-col items-center justify-center px-3 border-r">
            <span className="text-sm font-mono font-bold text-foreground leading-none">
              {r.score}%
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Match</span>
          </div>
        )}
        <Link href={`/resumes/${r.id}`}>
          <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-accent hover:text-foreground">
            <ChartBar size={16} /> <span className="hidden sm:inline">Analyze</span>
          </Button>
        </Link>
        <div className="px-1">
          <DeleteResumeButton id={r.id} />
        </div>
      </div>
    </div>
  );
}

export default async function ResumesPage() {
  const session = await requireAuth();
  const resumes = await db
    .select()
    .from(resume)
    .where(eq(resume.userId, session.user.id))
    .orderBy(desc(resume.createdAt))
    .limit(20);

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto pb-10">
      <PageHeader
        title="Resumes"
        description="Upload and manage your resumes for AI match analysis."
      />

      {/* Uploader */}
      <div>
        <h2 className="mb-4 text-sm font-semibold tracking-tight text-foreground">Upload Document</h2>
        <ResumeUploader />
      </div>

      {/* Resume List */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Your Resumes
          </h2>
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded-sm">
             {resumes.length} TOTAL
          </span>
        </div>

        {resumes.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title="No resumes yet"
            description="Upload your first resume to get started with AI-powered gap analysis."
          />
        ) : (
          <div className="space-y-1 mt-2">
            {resumes.map((r) => (
              <ResumeCard key={r.id} resume={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
