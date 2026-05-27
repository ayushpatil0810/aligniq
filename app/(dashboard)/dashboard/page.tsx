import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { resume, analysisResult, roadmap, jobDescription } from '@/db/schema';
import { eq, desc, count, avg } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileText, ChartBar, Lightning, ArrowRight, Target, Path } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>;
  const color = score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
  return <span className={cn('font-semibold tabular-nums', color)}>{score}</span>;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  href?: string;
}) {
  const content = (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary/30 hover:bg-card/80 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon size={16} weight="duotone" className="text-primary" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [
    resumeCount,
    analysisCount,
    recentAnalyses,
    activeRoadmap,
  ] = await Promise.all([
    db.select({ count: count() }).from(resume).where(eq(resume.userId, userId)),
    db.select({ count: count() }).from(analysisResult).where(eq(analysisResult.userId, userId)),
    db
      .select({
        id: analysisResult.id,
        matchScore: analysisResult.matchScore,
        readinessLevel: analysisResult.readinessLevel,
        status: analysisResult.status,
        createdAt: analysisResult.createdAt,
        jobId: analysisResult.jobId,
      })
      .from(analysisResult)
      .where(eq(analysisResult.userId, userId))
      .orderBy(desc(analysisResult.createdAt))
      .limit(5),
    db
      .select()
      .from(roadmap)
      .where(eq(roadmap.userId, userId))
      .orderBy(desc(roadmap.createdAt))
      .limit(1),
  ]);

  const totalResumes = resumeCount[0]?.count ?? 0;
  const totalAnalyses = analysisCount[0]?.count ?? 0;
  const latestRoadmap = activeRoadmap[0];

  // Fetch job titles for recent analyses
  const analysesWithJobs = await Promise.all(
    recentAnalyses.map(async (a) => {
      const [job] = await db
        .select({ title: jobDescription.title, company: jobDescription.company })
        .from(jobDescription)
        .where(eq(jobDescription.id, a.jobId));
      return { ...a, job };
    }),
  );

  const readinessMap: Record<string, { label: string; color: string }> = {
    'strong': { label: 'Strong', color: 'text-emerald-500 bg-emerald-500/10' },
    'ready': { label: 'Ready', color: 'text-blue-500 bg-blue-500/10' },
    'developing': { label: 'Developing', color: 'text-amber-500 bg-amber-500/10' },
    'not-ready': { label: 'Not Ready', color: 'text-red-500 bg-red-500/10' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${session.user.name?.split(' ')[0] ?? 'there'} 👋`}
        description="Here's your placement readiness overview."
        action={
          <Link href="/resumes">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" id="btn-upload-resume">
              <Lightning size={14} weight="fill" />
              Upload Resume
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Resumes"
          value={totalResumes}
          icon={FileText}
          sub="Uploaded to date"
          href="/resumes"
        />
        <StatCard
          label="Analyses Run"
          value={totalAnalyses}
          icon={ChartBar}
          sub="Match analyses"
          href="/analysis"
        />
        <StatCard
          label="Avg Match Score"
          value={recentAnalyses.length > 0
            ? `${Math.round(recentAnalyses.reduce((a, r) => a + (r.matchScore ?? 0), 0) / recentAnalyses.length)}%`
            : '—'}
          icon={Target}
          sub="Across all analyses"
        />
        <StatCard
          label="Roadmap Progress"
          value={latestRoadmap ? `${latestRoadmap.progress}%` : '—'}
          icon={Path}
          sub={latestRoadmap ? `Week ${latestRoadmap.currentWeek} of 4` : 'No active roadmap'}
          href={latestRoadmap ? `/roadmap/${latestRoadmap.id}` : '/roadmap'}
        />
      </div>

      {/* Recent Analyses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Analyses</h2>
          <Link href="/analysis" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {analysesWithJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <ChartBar size={32} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No analyses yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a resume and match it against a job description to see results here.
            </p>
            <Link href="/resumes" className="mt-4 inline-block">
              <Button size="sm" variant="outline" className="gap-2" id="btn-start-analysis">
                Get started <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {analysesWithJobs.map((a) => {
              const readiness = a.readinessLevel ? readinessMap[a.readinessLevel] : null;
              return (
                <Link
                  key={a.id}
                  href={`/analysis/${a.id}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/30 hover:bg-accent/30"
                  id={`analysis-${a.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ChartBar size={16} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {a.job?.title ?? 'Unknown Role'}
                        {a.job?.company && (
                          <span className="ml-1.5 text-muted-foreground font-normal">at {a.job.company}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {readiness && (
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', readiness.color)}>
                        {readiness.label}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <ScoreBadge score={a.matchScore} />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {totalResumes === 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Lightning size={20} weight="duotone" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Get started with AlignIQ</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Upload your resume to get an AI-powered analysis of your placement readiness.
                AlignIQ will identify skill gaps, score your fit, and generate a personalized learning roadmap.
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="/resumes">
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" id="btn-quickstart-upload">
                    <FileText size={13} weight="fill" /> Upload Resume
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="outline" className="gap-1.5" id="btn-quickstart-browse">
                    <Briefcase size={13} /> Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Briefcase({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      fill="currentColor"
    >
      <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,200H40V72H216V200Z" />
    </svg>
  );
}
