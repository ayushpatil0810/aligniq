import Link from 'next/link';
import { ArrowRight, Briefcase } from '@phosphor-icons/react/dist/ssr';
import type { JobDescription } from '@/db/schema';

interface Props {
  job: JobDescription;
}

export function JobCard({ job }: Props) {
  const requirements = job.requirements as { technicalSkills?: string[] } | null;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col gap-4 rounded-md border border-border/60 bg-transparent p-5 transition-colors hover:border-foreground/30 cursor-pointer"
      id={`job-card-${job.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase size={16} />
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground"
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{job.title}</h3>
        <p className="text-xs text-muted-foreground">{job.company}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-sm border border-border/50 px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium text-foreground">
          {job.level}
        </span>
        <span className="rounded-sm bg-accent/50 px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
          {job.category}
        </span>
      </div>

      {requirements?.technicalSkills && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-4 border-t border-border/30">
          {requirements.technicalSkills.slice(0, 4).map((skill, i) => (
            <span key={skill} className="text-[11px] text-muted-foreground flex items-center">
              {skill}
              {i < 3 && i < requirements.technicalSkills!.length - 1 && (
                 <span className="ml-1.5 text-muted-foreground/30">•</span>
              )}
            </span>
          ))}
          {requirements.technicalSkills.length > 4 && (
            <span className="text-[10px] text-muted-foreground/50 self-center uppercase tracking-wider font-mono ml-1">
              +{requirements.technicalSkills.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
