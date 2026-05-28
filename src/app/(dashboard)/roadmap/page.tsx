import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { roadmap, analysisResult, jobDescription } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Path, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function RoadmapListPage() {
	const session = await requireAuth();

	const roadmaps = await db
		.select()
		.from(roadmap)
		.where(eq(roadmap.userId, session.user.id))
		.orderBy(desc(roadmap.createdAt))
		.limit(20);

	const roadmapsWithDetails = await Promise.all(
		roadmaps.map(async (r) => {
			const [analysis] = await db
				.select({ jobId: analysisResult.jobId })
				.from(analysisResult)
				.where(eq(analysisResult.id, r.analysisId));
			if (!analysis) return { ...r, job: null };
			const [job] = await db
				.select({ title: jobDescription.title })
				.from(jobDescription)
				.where(eq(jobDescription.id, analysis.jobId));
			return { ...r, job };
		})
	);

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader
				title="Learning Roadmaps"
				description={`${roadmaps.length} roadmap${roadmaps.length !== 1 ? 's' : ''} created`}
			/>

			{roadmaps.length === 0 ? (
				<EmptyState
					icon={<Path size={20} />}
					title="No roadmaps yet"
					description="Run a gap analysis and generate a personalized 4-week learning roadmap."
				/>
			) : (
				<div className="space-y-2">
					{roadmapsWithDetails.map((r) => (
						<Link
							key={r.id}
							href={`/roadmap/${r.id}`}
							className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/30"
							id={`roadmap-row-${r.id}`}
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Path size={16} weight="duotone" className="text-primary" />
								</div>
								<div>
									<p className="text-sm font-medium text-foreground">
										{r.job?.title ?? 'Roadmap'}{' '}
									</p>
									<p className="text-xs text-muted-foreground">
										Week {r.currentWeek} of 4 · {new Date(r.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4 shrink-0">
								<div className="w-24">
									<div className="flex items-center justify-between mb-1">
										<span className="text-[10px] text-muted-foreground">Progress</span>
										<span className="text-[10px] font-semibold text-primary">{r.progress}%</span>
									</div>
									<div className="h-1 w-full overflow-hidden rounded-full bg-border">
										<div
											className="h-full rounded-full bg-primary"
											style={{ width: `${r.progress}%` }}
										/>
									</div>
								</div>
								<ArrowRight
									size={14}
									className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
								/>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
