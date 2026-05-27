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

function ResumeCard({ resume: r }: { resume: Resume }) {
  const status = statusConfig[r.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const parsedData = r.parsedData as { experienceLevel?: string; technicalSkills?: string[] } | null;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-border/50 transition-colors hover:bg-accent/20 px-3 -mx-3 rounded-md">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 text-muted-foreground/40">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground tracking-tight">{r.fileName}</p>
          <div className="mt-1 flex items-center flex-wrap gap-2.5">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              <StatusIcon size={12} weight={r.status === 'done' ? "fill" : "regular"} className={r.status === 'done' ? 'text-foreground' : ''} />
              {status.label}
            </span>
            {parsedData?.experienceLevel && (
              <>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {parsedData.experienceLevel}
                </span>
              </>
            )}
            {parsedData?.technicalSkills && (
              <>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {parsedData.technicalSkills.length} SKILLS
                </span>
              </>
            )}
            <span className="text-muted-foreground/30 text-[10px]">•</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
               {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {r.score !== null && (
          <div className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 bg-accent/30">
            <span className="text-xs font-mono font-medium text-foreground">
              {r.score}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">score</span>
          </div>
        )}
        <Link href={`/resumes/${r.id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ChartBar size={14} /> Analyze
          </Button>
        </Link>
        <div className="ml-1 pl-2 border-l border-border/50">
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
