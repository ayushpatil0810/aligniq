import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { interviewQuestion, analysisResult, jobDescription } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ChatDots, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default async function InterviewListPage() {
	const session = await requireAuth();

	const interviews = await db
		.select()
		.from(interviewQuestion)
		.where(eq(interviewQuestion.userId, session.user.id))
		.orderBy(desc(interviewQuestion.createdAt))
		.limit(20);

	const interviewsWithDetails = await Promise.all(
		interviews.map(async (i) => {
			const [analysis] = await db
				.select({ jobId: analysisResult.jobId })
				.from(analysisResult)
				.where(eq(analysisResult.id, i.analysisId));
			if (!analysis) return { ...i, job: null };
			const [job] = await db
				.select({ title: jobDescription.title, company: jobDescription.company })
				.from(jobDescription)
				.where(eq(jobDescription.id, analysis.jobId));
			return { ...i, job };
		})
	);

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader
				title="Interview Prep"
				description={`${interviews.length} question set${interviews.length !== 1 ? 's' : ''} generated`}
			/>

			{interviews.length === 0 ? (
				<EmptyState
					icon={<ChatDots size={20} />}
					title="No interview questions yet"
					description="Run a gap analysis and generate AI-powered interview questions tailored to your profile."
				/>
			) : (
				<div className="space-y-2">
					{interviewsWithDetails.map((i) => {
						const questions = i.questions as Array<{ category: string }>;
						const technicalCount = questions.filter((q) => q.category === 'technical').length;
						const behavioralCount = questions.filter((q) => q.category === 'behavioral').length;

						return (
							<Link
								key={i.id}
								href={`/interview/${i.id}`}
								className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/30"
								id={`interview-row-${i.id}`}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
										<ChatDots size={16} weight="duotone" className="text-primary" />
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">
											{i.job?.title ?? 'Interview Set'}{' '}
											{i.job?.company && (
												<span className="text-muted-foreground font-normal text-xs">
													at {i.job.company}
												</span>
											)}
										</p>
										<p className="text-xs text-muted-foreground">
											{questions.length} questions · {technicalCount} technical · {behavioralCount}{' '}
											behavioral · {new Date(i.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<ArrowRight
									size={14}
									className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0"
								/>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
