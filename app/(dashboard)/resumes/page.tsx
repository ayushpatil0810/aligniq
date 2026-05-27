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

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  done: { icon: CheckCircle, label: 'Parsed', color: 'text-emerald-500' },
  processing: { icon: Clock, label: 'Processing', color: 'text-amber-500' },
  pending: { icon: Clock, label: 'Pending', color: 'text-muted-foreground' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-500' },
};

function ResumeCard({ resume: r }: { resume: Resume }) {
  const status = statusConfig[r.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const parsedData = r.parsedData as { experienceLevel?: string; technicalSkills?: string[] } | null;

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText size={18} weight="duotone" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{r.fileName}</p>
        <div className="mt-0.5 flex items-center gap-3">
          <span className={cn('flex items-center gap-1 text-xs', status.color)}>
            <StatusIcon size={12} weight="fill" />
            {status.label}
          </span>
          {parsedData?.experienceLevel && (
            <span className="text-xs text-muted-foreground capitalize">
              {parsedData.experienceLevel}
            </span>
          )}
          {parsedData?.technicalSkills && (
            <span className="text-xs text-muted-foreground">
              {parsedData.technicalSkills.length} skills detected
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {r.score !== null && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1">
            <span className={cn(
              'text-sm font-semibold',
              (r.score ?? 0) >= 75 ? 'text-emerald-500' : (r.score ?? 0) >= 50 ? 'text-amber-500' : 'text-red-500',
            )}>
              {r.score}
            </span>
            <span className="text-xs text-muted-foreground">score</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
        <Link href={`/resumes/${r.id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" id={`btn-view-resume-${r.id}`}>
            <ChartBar size={13} /> Analyze
          </Button>
        </Link>
        <div className="ml-1 flex items-center border-l border-border pl-2">
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Resumes"
        description="Upload and manage your resumes. Each resume can be matched against multiple job descriptions."
      />

      {/* Uploader */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Upload New Resume</h2>
        <ResumeUploader />
      </div>

      {/* Resume List */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Your Resumes
          {resumes.length > 0 && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {resumes.length}
            </span>
          )}
        </h2>

        {resumes.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title="No resumes yet"
            description="Upload your first resume to get started with AI-powered gap analysis."
          />
        ) : (
          <div className="space-y-2">
            {resumes.map((r) => (
              <ResumeCard key={r.id} resume={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
