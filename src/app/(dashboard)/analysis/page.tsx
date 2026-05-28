import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { analysisResult, jobDescription, resume } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ChartBar, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const readinessConfig: Record<string, { label: string; color: string }> = {
	strong: { label: 'Strong', color: 'text-emerald-500 bg-emerald-500/10' },
	ready: { label: 'Ready', color: 'text-blue-500 bg-blue-500/10' },
	developing: { label: 'Developing', color: 'text-amber-500 bg-amber-500/10' },
	'not-ready': { label: 'Not Ready', color: 'text-red-500 bg-red-500/10' },
};

export default async function AnalysisListPage() {
	const session = await requireAuth();

	const analyses = await db
		.select({
			id: analysisResult.id,
			matchScore: analysisResult.matchScore,
			readinessLevel: analysisResult.readinessLevel,
			status: analysisResult.status,
			createdAt: analysisResult.createdAt,
			jobId: analysisResult.jobId,
			resumeId: analysisResult.resumeId,
		})
		.from(analysisResult)
		.where(eq(analysisResult.userId, session.user.id))
		.orderBy(desc(analysisResult.createdAt))
		.limit(50);

	const analysesWithDetails = await Promise.all(
		analyses.map(async (a) => {
			const [[job], [resumeRecord]] = await Promise.all([
				db
					.select({ title: jobDescription.title })
					.from(jobDescription)
					.where(eq(jobDescription.id, a.jobId)),
				db.select({ fileName: resume.fileName }).from(resume).where(eq(resume.id, a.resumeId)),
			]);
			return { ...a, job, resumeRecord };
		})
	);

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader title="All Analyses" description={`${analyses.length} analyses run`} />

			{analyses.length === 0 ? (
				<EmptyState
					icon={<ChartBar size={20} />}
					title="No analyses yet"
					description="Upload a resume and run a gap analysis to see results here."
				/>
			) : (
				<div className="space-y-2">
					{analysesWithDetails.map((a) => {
						const readiness = a.readinessLevel ? readinessConfig[a.readinessLevel] : null;
						return (
							<Link
								key={a.id}
								href={`/analysis/${a.id}`}
								className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/30"
								id={`analysis-row-${a.id}`}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
										<ChartBar size={16} weight="duotone" className="text-primary" />
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">
											{a.job?.title ?? 'Unknown Role'}
										</p>
										<p className="text-xs text-muted-foreground">
											{a.resumeRecord?.fileName ?? 'Unknown resume'} ·{' '}
											{new Date(a.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									{readiness && (
										<span
											className={cn(
												'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
												readiness.color
											)}
										>
											{readiness.label}
										</span>
									)}
									{a.matchScore !== null && (
										<span
											className={cn(
												'text-sm font-semibold tabular-nums',
												(a.matchScore ?? 0) >= 75
													? 'text-emerald-500'
													: (a.matchScore ?? 0) >= 50
														? 'text-amber-500'
														: 'text-red-500'
											)}
										>
											{a.matchScore}%
										</span>
									)}
									<ArrowRight
										size={14}
										className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
									/>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
