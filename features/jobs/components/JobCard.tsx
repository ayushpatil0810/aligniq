import Link from 'next/link';
import { ArrowRight, Briefcase } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import type { JobDescription } from '@/db/schema';

const levelColors: Record<string, string> = {
  intern: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  junior: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  mid: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  senior: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  staff: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  principal: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const categoryColors: Record<string, string> = {
  frontend: 'text-sky-500',
  backend: 'text-green-500',
  fullstack: 'text-violet-500',
  mobile: 'text-pink-500',
  devops: 'text-orange-500',
  data: 'text-amber-500',
  ai: 'text-indigo-500',
  design: 'text-rose-500',
};

interface Props {
  job: JobDescription;
}

export function JobCard({ job }: Props) {
  const requirements = job.requirements as { technicalSkills?: string[] } | null;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary/30 hover:shadow-sm cursor-pointer"
      id={`job-card-${job.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Briefcase size={16} weight="duotone" className="text-primary" />
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold leading-tight text-foreground">{job.title}</h3>
        <p className="text-xs text-muted-foreground">{job.company}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={cn('rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize', levelColors[job.level])}>
          {job.level}
        </span>
        <span className={cn('rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium capitalize', categoryColors[job.category])}>
          {job.category}
        </span>
      </div>

      {requirements?.technicalSkills && (
        <div className="flex flex-wrap gap-1">
          {requirements.technicalSkills.slice(0, 5).map((skill) => (
            <span key={skill} className="rounded px-1.5 py-0.5 text-[10px] bg-secondary text-muted-foreground">
              {skill}
            </span>
          ))}
          {requirements.technicalSkills.length > 5 && (
            <span className="text-[10px] text-muted-foreground/60 self-center">
              +{requirements.technicalSkills.length - 5}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
