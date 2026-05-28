import Link from 'next/link';
import { ArrowRight, Briefcase } from '@phosphor-icons/react/dist/ssr';
import type { JobDescription } from '@/db/schema';

interface Props {
	job: JobDescription;
}

import { Badge } from '@/components/ui/badge';

export function JobCard({ job }: Props) {
	const requirements = job.requirements as { technicalSkills?: string[] } | null;

	return (
		<Link
			href={`/jobs/${job.id}`}
			className="group flex flex-col gap-5 rounded-xl border bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-sm"
			id={`job-card-${job.id}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground border">
					<Briefcase size={20} />
				</div>
				<ArrowRight
					size={16}
					className="shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground mt-1"
				/>
			</div>

			<div className="space-y-1">
				<h3 className="text-base font-semibold tracking-tight text-foreground">{job.title}</h3>
				<p className="text-sm text-muted-foreground">{job.company}</p>
			</div>

			<div className="flex flex-wrap gap-2 mt-1">
				<Badge
					variant="outline"
					className="bg-transparent text-[10px] tracking-wider uppercase font-medium"
				>
					{job.level}
				</Badge>
				<Badge
					variant="secondary"
					className="text-foreground text-[10px] tracking-wider uppercase font-medium"
				>
					{job.category}
				</Badge>
			</div>

			{requirements?.technicalSkills && (
				<div className="mt-2 flex flex-wrap items-center gap-1.5 pt-4 border-t border-border/50">
					{requirements.technicalSkills.slice(0, 4).map((skill, i) => (
						<span
							key={skill}
							className="text-xs text-muted-foreground font-medium flex items-center"
						>
							{skill}
							{i < 3 && i < requirements.technicalSkills!.length - 1 && (
								<span className="ml-2 text-muted-foreground/30">•</span>
							)}
						</span>
					))}
					{requirements.technicalSkills.length > 4 && (
						<Badge
							variant="outline"
							className="text-[9px] uppercase tracking-wider text-muted-foreground ml-1 bg-transparent"
						>
							+{requirements.technicalSkills.length - 4} MORE
						</Badge>
					)}
				</div>
			)}
		</Link>
	);
}
