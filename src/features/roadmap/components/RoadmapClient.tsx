'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Square, Clock, BookOpen, ArrowRight, Trophy } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getAiHeaders } from '@/lib/utils/ai-config';
import type { RoadmapWeek } from '@/ai/schemas/roadmap';

interface Props {
	roadmapId: string;
	weeks: RoadmapWeek[];
	initialWeek: number;
	initialProgress: number;
}

function WeekCard({
	week,
	isActive,
	isCompleted,
	completedTopics,
	onToggleTopic,
}: {
	week: RoadmapWeek;
	isActive: boolean;
	isCompleted: boolean;
	completedTopics: Set<string>;
	onToggleTopic: (topicKey: string) => void;
}) {
	const [expanded, setExpanded] = useState(isActive);

	return (
		<div
			className={cn(
				'rounded-xl border transition-all duration-200',
				isActive
					? 'border-primary/40 bg-card'
					: isCompleted
						? 'border-emerald-500/30 bg-card'
						: 'border-border bg-card/50'
			)}
		>
			<button
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center justify-between p-5 text-left"
				id={`roadmap-week-${week.week}`}
			>
				<div className="flex items-center gap-4">
					<div
						className={cn(
							'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
							isCompleted
								? 'bg-emerald-500/10 text-emerald-500'
								: isActive
									? 'bg-primary/10 text-primary'
									: 'bg-muted text-muted-foreground'
						)}
					>
						{isCompleted ? <Trophy size={16} weight="fill" /> : `W${week.week}`}
					</div>
					<div>
						<p
							className={cn(
								'text-sm font-semibold',
								isActive ? 'text-foreground' : 'text-muted-foreground'
							)}
						>
							Week {week.week}: {week.title}
						</p>
						<p className="text-xs text-muted-foreground">
							{week.goals.length} goals · {week.topics.length} topics
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{isActive && (
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
							Current
						</span>
					)}
					<ArrowRight
						size={14}
						className={cn(
							'text-muted-foreground transition-transform duration-200',
							expanded && 'rotate-90'
						)}
					/>
				</div>
			</button>

			{expanded && (
				<div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
					{/* Goals */}
					<div>
						<h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Weekly Goals
						</h4>
						<ul className="space-y-1.5">
							{week.goals.map((goal, i) => (
								<li key={i} className="flex items-start gap-2 text-xs text-foreground">
									<ArrowRight size={11} className="mt-0.5 shrink-0 text-primary" />
									{goal}
								</li>
							))}
						</ul>
					</div>

					{/* Topics */}
					<div>
						<h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Topics to Cover
						</h4>
						<div className="space-y-3">
							{week.topics.map((topic, i) => (
								<div key={i} className="rounded-lg border border-border bg-background/50 p-3">
									<div className="flex items-center justify-between mb-2">
										<button
											onClick={() => onToggleTopic(`${week.week}-${i}`)}
											className="flex items-center gap-2 text-left cursor-pointer"
											id={`topic-${week.week}-${i}`}
										>
											{completedTopics.has(`${week.week}-${i}`) ? (
												<CheckSquare
													size={16}
													weight="fill"
													className="shrink-0 text-emerald-500"
												/>
											) : (
												<Square size={16} className="shrink-0 text-muted-foreground" />
											)}
											<span
												className={cn(
													'text-sm font-medium',
													completedTopics.has(`${week.week}-${i}`) &&
														'line-through text-muted-foreground'
												)}
											>
												{topic.name}
											</span>
										</button>
										<span className="flex items-center gap-1 text-[11px] text-muted-foreground">
											<Clock size={11} /> {topic.estimatedHours}h
										</span>
									</div>
									{topic.resources.length > 0 && (
										<div className="ml-6 mt-1">
											{topic.resources.map((r, ri) => (
												<div
													key={ri}
													className="flex items-center gap-1.5 text-[11px] text-primary/70"
												>
													<BookOpen size={11} />
													<span>{r}</span>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Daily Practice & Milestone */}
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-lg border border-border bg-background/50 p-3">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
								Daily Practice
							</p>
							<p className="text-xs text-foreground">{week.dailyPractice}</p>
						</div>
						<div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60 mb-1">
								Milestone
							</p>
							<p className="text-xs text-foreground">{week.milestone}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export function RoadmapClient({ roadmapId, weeks, initialWeek, initialProgress }: Props) {
	const [currentWeek] = useState(initialWeek);
	const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
	const [hasHydrated, setHasHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(`roadmap-progress:${roadmapId}`);
			setCompletedTopics(stored ? new Set<string>(JSON.parse(stored)) : new Set());
		} catch {
			setCompletedTopics(new Set());
		}
		setHasHydrated(true);
	}, [roadmapId]);

	useEffect(() => {
		try {
			window.localStorage.setItem(
				`roadmap-progress:${roadmapId}`,
				JSON.stringify(Array.from(completedTopics))
			);
		} catch {
			// Ignore storage errors (private mode or quota).
		}
	}, [completedTopics, roadmapId]);

	const totalHours = useMemo(
		() => weeks.reduce((sum, w) => sum + w.topics.reduce((s, t) => s + t.estimatedHours, 0), 0),
		[weeks]
	);

	const totalTopics = useMemo(() => weeks.reduce((sum, w) => sum + w.topics.length, 0), [weeks]);

	const computedProgress =
		totalTopics > 0 ? Math.round((completedTopics.size / totalTopics) * 100) : initialProgress;
	const progress = hasHydrated ? computedProgress : initialProgress;

	const [lastSyncedProgress, setLastSyncedProgress] = useState<number | null>(null);

	useEffect(() => {
		if (progress === lastSyncedProgress) return;

		const controller = new AbortController();
		const timeout = window.setTimeout(async () => {
			try {
				const res = await fetch('/api/roadmap/progress', {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						...getAiHeaders(),
					},
					body: JSON.stringify({ roadmapId, progress }),
					signal: controller.signal,
				});

				if (res.ok) {
					setLastSyncedProgress(progress);
				}
			} catch {
				// Ignore network errors; the next toggle will retry.
			}
		}, 400);

		return () => {
			controller.abort();
			window.clearTimeout(timeout);
		};
	}, [progress, roadmapId, lastSyncedProgress]);

	function toggleTopic(topicKey: string) {
		setCompletedTopics((prev) => {
			const next = new Set(prev);
			if (next.has(topicKey)) next.delete(topicKey);
			else next.add(topicKey);
			return next;
		});
	}

	return (
		<div className="space-y-4">
			{/* Overview */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{ label: 'Total Duration', value: '4 Weeks', sub: 'Structured plan' },
					{ label: 'Estimated Hours', value: `${totalHours}h`, sub: 'Total learning time' },
					{ label: 'Current Week', value: `Week ${currentWeek}`, sub: 'Active phase' },
				].map((s) => (
					<div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
						<p className="text-2xl font-bold text-foreground">{s.value}</p>
						<p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
					</div>
				))}
			</div>

			{/* Progress */}
			<div className="rounded-xl border border-border bg-card p-5">
				<div className="mb-2 flex items-center justify-between">
					<span className="text-sm font-medium text-foreground">Overall Progress</span>
					<span className="text-sm font-semibold text-primary">{progress}%</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-border">
					<div
						className="h-full rounded-full bg-primary transition-all duration-700"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Week Cards */}
			<div className="space-y-3">
				{weeks.map((week) => (
					<WeekCard
						key={week.week}
						week={week}
						isActive={week.week === currentWeek}
						isCompleted={week.week < currentWeek}
						completedTopics={completedTopics}
						onToggleTopic={toggleTopic}
					/>
				))}
			</div>
		</div>
	);
}
