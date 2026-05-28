import { db } from '@/server/db';
import { jobDescription } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Briefcase } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const levelColors: Record<string, string> = {
	junior: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
	mid: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
	senior: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
	staff: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const [job] = await db.select().from(jobDescription).where(eq(jobDescription.id, id));

	if (!job) notFound();

	const requirements = job.requirements as {
		technicalSkills?: string[];
		softSkills?: string[];
		experienceYears?: number;
		education?: string;
		niceToHave?: string[];
	} | null;

	return (
		<div className="space-y-6 animate-fade-in max-w-3xl">
			<div className="flex items-start justify-between gap-4">
				<PageHeader
					title={job.title}
					description={`${job.level} · ${job.category}`}
				/>
				<Link href="/resumes">
					<Button
						size="sm"
						className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
						id="btn-analyze-this-job"
					>
						<Briefcase size={14} weight="fill" /> Analyze Against My Resume
					</Button>
				</Link>
			</div>

			<div className="flex gap-2">
				<span
					className={cn(
						'rounded-md border px-2.5 py-1 text-xs font-medium capitalize',
						levelColors[job.level] ?? 'bg-muted text-muted-foreground border-border'
					)}
				>
					{job.level}
				</span>
				<span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
					{job.category}
				</span>
			</div>

			{/* Description */}
			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="mb-3 text-sm font-semibold text-foreground">Job Description</h2>
				<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
					{job.description}
				</p>
			</div>

			{requirements && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{requirements.technicalSkills && (
						<div className="rounded-xl border border-border bg-card p-5">
							<h3 className="mb-3 text-sm font-semibold text-foreground">Technical Requirements</h3>
							<div className="flex flex-wrap gap-1.5">
								{requirements.technicalSkills.map((s) => (
									<span
										key={s}
										className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-foreground"
									>
										{s}
									</span>
								))}
							</div>
							{requirements.experienceYears !== undefined && (
								<p className="mt-3 text-xs text-muted-foreground">
									{requirements.experienceYears}+ years of experience required
								</p>
							)}
						</div>
					)}
					{requirements.softSkills && (
						<div className="rounded-xl border border-border bg-card p-5">
							<h3 className="mb-3 text-sm font-semibold text-foreground">Soft Skills</h3>
							<ul className="space-y-1">
								{requirements.softSkills.map((s) => (
									<li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
										<span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
										{s}
									</li>
								))}
							</ul>
						</div>
					)}
					{requirements.niceToHave && requirements.niceToHave.length > 0 && (
						<div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
							<h3 className="mb-3 text-sm font-semibold text-foreground">Nice to Have</h3>
							<div className="flex flex-wrap gap-1.5">
								{requirements.niceToHave.map((s) => (
									<span
										key={s}
										className="rounded-md border border-dashed border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
									>
										{s}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
