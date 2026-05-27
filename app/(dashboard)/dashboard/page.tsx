import { requireAuth } from '@/server/auth';
import { getDashboardStats, getRecentAnalysesWithJobs } from '@/data-access/dashboard';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileText, ChartBar, Lightning, ArrowRight, Target, Path, Briefcase } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-xs font-mono">—</span>;
  return <span className="text-xs font-mono font-medium text-foreground bg-accent px-1.5 py-0.5 rounded-sm">{score}%</span>;
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
    <div className="group rounded-md border border-border/60 bg-transparent p-5 transition-colors hover:border-foreground/20 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-foreground mb-1">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [stats, analysesWithJobs] = await Promise.all([
    getDashboardStats(userId),
    getRecentAnalysesWithJobs(userId)
  ]);

  const { totalResumes, totalAnalyses, latestRoadmap } = stats;

  const readinessMap: Record<string, { label: string; className: string }> = {
    'strong': { label: 'Strong', className: 'text-foreground border-foreground' },
    'ready': { label: 'Ready', className: 'text-muted-foreground border-border' },
    'developing': { label: 'Developing', className: 'text-muted-foreground border-border border-dashed' },
    'not-ready': { label: 'Not Ready', className: 'text-muted-foreground/50 border-border/50' },
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-10">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${session.user.name?.split(' ')[0] ?? 'there'}.`}
        description="Here is your placement readiness overview."
        className="mb-8"
        action={
          <Link href="/resumes">
            <Button size="sm" className="gap-2 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 rounded-sm" id="btn-upload-resume">
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
          value={analysesWithJobs.length > 0
            ? `${Math.round(analysesWithJobs.reduce((a, r) => a + (r.matchScore ?? 0), 0) / analysesWithJobs.length)}%`
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
        <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Analyses</h2>
          <Link href="/analysis" className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight size={10} />
          </Link>
        </div>

        {analysesWithJobs.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-12 text-center">
            <ChartBar size={24} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No analyses yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
              Upload a resume and match it against a job description to see results here.
            </p>
            <Link href="/resumes" className="mt-6 inline-block">
              <Button size="sm" variant="outline" className="gap-2 text-xs rounded-sm" id="btn-start-analysis">
                Get started <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {analysesWithJobs.map((a) => {
              const readiness = a.readinessLevel ? readinessMap[a.readinessLevel] : null;
              return (
                <div key={a.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      <ChartBar size={16} className="text-muted-foreground/50" />
                    </div>
                    <div>
                      <Link href={`/analysis/${a.id}`} className="text-sm font-medium text-foreground hover:underline decoration-border underline-offset-4">
                        {a.job?.title ?? 'Unknown Role'}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {a.job?.company ? `at ${a.job.company} · ` : ''}
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-accent/50 px-1.5 py-0.5 rounded-sm">
                          Match Score
                        </span>
                        <ScoreBadge score={a.matchScore} />
                        {readiness && (
                          <span className={cn('text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-sm border', readiness.className)}>
                            {readiness.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex shrink-0">
                    <Link href={`/analysis/${a.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                        View Analysis <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {totalResumes === 0 && (
        <div className="mt-12 rounded-md border border-border bg-transparent p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
              <Lightning size={20} className="text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Get started with AlignIQ</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
                Upload your resume to get an AI-powered analysis of your placement readiness.
                AlignIQ will identify skill gaps, score your fit, and generate a personalized learning roadmap.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/resumes">
                  <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-sm shadow-none" id="btn-quickstart-upload">
                    <FileText size={14} /> Upload Resume
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="outline" className="gap-2 rounded-sm shadow-none" id="btn-quickstart-browse">
                    <Briefcase size={14} /> Browse Jobs
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
