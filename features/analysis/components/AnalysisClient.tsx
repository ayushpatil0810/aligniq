'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	CheckCircle,
	XCircle,
	Warning,
	Path,
	ChatDots,
	ArrowRight,
	TrendUp,
	TrendDown,
	Clock,
} from '@phosphor-icons/react';
import {
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	Radar,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/db/schema';

interface Props {
	analysis: AnalysisResult;
	hasRoadmap: boolean;
	hasInterview: boolean;
	roadmapId?: string;
	interviewId?: string;
}

const readinessConfig: Record<string, { label: string; color: string; bg: string }> = {
	strong: {
		label: 'Strong Candidate',
		color: 'text-emerald-500',
		bg: 'bg-emerald-500/10 border-emerald-500/20',
	},
	ready: { label: 'Ready', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
	developing: {
		label: 'Developing',
		color: 'text-amber-500',
		bg: 'bg-amber-500/10 border-amber-500/20',
	},
	'not-ready': {
		label: 'Not Ready Yet',
		color: 'text-red-500',
		bg: 'bg-red-500/10 border-red-500/20',
	},
};

const priorityConfig: Record<string, { color: string; label: string }> = {
	high: { color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'High' },
	medium: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Medium' },
	low: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'Low' },
};

function ScoreRing({ score }: { score: number }) {
	const radius = 52;
	const circ = 2 * Math.PI * radius;
	const filled = (score / 100) * circ;
	const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

	return (
		<div className="relative flex items-center justify-center">
			<svg width={128} height={128} viewBox="0 0 128 128">
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					className="text-border"
				/>
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth="8"
					strokeDasharray={`${filled} ${circ}`}
					strokeLinecap="round"
					transform="rotate(-90 64 64)"
					style={{ transition: 'stroke-dasharray 1s ease-out' }}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				<span className="text-2xl font-bold tabular-nums" style={{ color }}>
					{score}
				</span>
				<span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
			</div>
		</div>
	);
}

export function AnalysisClient({
	analysis,
	hasRoadmap,
	hasInterview,
	roadmapId,
	interviewId,
}: Props) {
	const router = useRouter();
	const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
	const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

	const skillsMatched =
		(analysis.skillsMatched as Array<{
			skill: string;
			proficiencyLevel: string;
			relevance: string;
		}>) ?? [];
	const skillsMissing =
		(analysis.skillsMissing as Array<{
			skill: string;
			priority: string;
			learningTimeWeeks: number;
			reason: string;
		}>) ?? [];
	const strengths = (analysis.strengths as string[]) ?? [];
	const weaknesses = (analysis.weaknesses as string[]) ?? [];
	const readiness = analysis.readinessLevel ? readinessConfig[analysis.readinessLevel] : null;

	// Radar chart data
	const radarData = [
		{
			subject: 'Technical Match',
			value: Math.min(
				100,
				(skillsMatched.filter((s) => s.relevance === 'core').length /
					Math.max(
						1,
						skillsMatched.length + skillsMissing.filter((s) => s.priority === 'high').length
					)) *
					100
			),
		},
		{ subject: 'Skill Breadth', value: Math.min(100, skillsMatched.length * 8) },
		{
			subject: 'Gap Severity',
			value: Math.max(0, 100 - skillsMissing.filter((s) => s.priority === 'high').length * 20),
		},
		{ subject: 'Overall Fit', value: analysis.matchScore ?? 0 },
		{ subject: 'Strengths', value: Math.min(100, strengths.length * 20) },
	];

	async function generateRoadmap() {
		setIsGeneratingRoadmap(true);
		try {
			const { data } = await axios.post('/api/roadmap', { analysisId: analysis.id });
			toast.success('Roadmap generated! Redirecting...');
			router.push(`/roadmap/${data.id}`);
		} catch {
			toast.error('Failed to generate roadmap');
		} finally {
			setIsGeneratingRoadmap(false);
		}
	}

	async function generateInterview() {
		setIsGeneratingInterview(true);
		try {
			const { data } = await axios.post('/api/interview', { analysisId: analysis.id });
			toast.success('Interview questions ready!');
			router.push(`/interview/${data.id}`);
		} catch {
			toast.error('Failed to generate interview questions');
		} finally {
			setIsGeneratingInterview(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* Score Overview */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Score Ring */}
				<div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
					<ScoreRing score={analysis.matchScore ?? 0} />
					<p className="mt-3 text-sm font-semibold text-foreground">Match Score</p>
					{readiness && (
						<span
							className={cn(
								'mt-2 rounded-full border px-3 py-1 text-xs font-medium',
								readiness.bg,
								readiness.color
							)}
						>
							{readiness.label}
						</span>
					)}
				</div>

				{/* Radar */}
				<div className="rounded-xl border border-border bg-card p-5">
					<h3 className="mb-3 text-sm font-semibold text-foreground">Skill Radar</h3>
					<ResponsiveContainer width="100%" height={200}>
						<RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
							<PolarGrid stroke="hsl(var(--border))" />
							<PolarAngleAxis
								dataKey="subject"
								tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
							/>
							<Radar
								dataKey="value"
								stroke="hsl(var(--primary))"
								fill="hsl(var(--primary))"
								fillOpacity={0.15}
								strokeWidth={2}
							/>
							<Tooltip
								contentStyle={{
									background: 'hsl(var(--popover))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px',
									fontSize: '11px',
								}}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>

				{/* AI Insights */}
				<div className="rounded-xl border border-border bg-card p-5">
					<h3 className="mb-3 text-sm font-semibold text-foreground">AI Insights</h3>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{analysis.insights ?? 'No insights available.'}
					</p>
				</div>
			</div>

			{/* Strengths & Weaknesses */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-5">
					<div className="mb-3 flex items-center gap-2">
						<TrendUp size={15} className="text-emerald-500" />
						<h3 className="text-sm font-semibold text-foreground">Strengths</h3>
					</div>
					<ul className="space-y-2">
						{strengths.map((s, i) => (
							<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
								<CheckCircle size={13} weight="fill" className="mt-0.5 shrink-0 text-emerald-500" />
								{s}
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-xl border border-border bg-card p-5">
					<div className="mb-3 flex items-center gap-2">
						<TrendDown size={15} className="text-amber-500" />
						<h3 className="text-sm font-semibold text-foreground">Areas to Improve</h3>
					</div>
					<ul className="space-y-2">
						{weaknesses.map((w, i) => (
							<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
								<Warning size={13} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
								{w}
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Skills Gap */}
			<div className="rounded-xl border border-border bg-card p-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-sm font-semibold text-foreground">
						Skill Gaps
						<span className="ml-2 text-xs font-normal text-muted-foreground">
							{skillsMissing.length} skills to acquire
						</span>
					</h3>
				</div>
				<div className="space-y-2">
					{skillsMissing.map((s, i) => {
						const pCfg = priorityConfig[s.priority] ?? priorityConfig.low;
						return (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
							>
								<div className="flex items-center gap-3">
									<XCircle size={15} className="shrink-0 text-muted-foreground/50" />
									<div>
										<p className="text-sm font-medium text-foreground">{s.skill}</p>
										{s.reason && <p className="text-[11px] text-muted-foreground">{s.reason}</p>}
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<span
										className={cn(
											'rounded-md border px-2 py-0.5 text-[10px] font-medium',
											pCfg.color
										)}
									>
										{pCfg.label}
									</span>
									<span className="flex items-center gap-1 text-[11px] text-muted-foreground">
										<Clock size={11} />
										{s.learningTimeWeeks}w
									</span>
								</div>
							</div>
						);
					})}
					{skillsMissing.length === 0 && (
						<p className="text-center py-4 text-sm text-muted-foreground">
							No significant skill gaps detected! 🎉
						</p>
					)}
				</div>
			</div>

			{/* Matched Skills */}
			<div className="rounded-xl border border-border bg-card p-5">
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					Matched Skills
					<span className="ml-2 text-xs font-normal text-muted-foreground">
						{skillsMatched.length} skills
					</span>
				</h3>
				<div className="flex flex-wrap gap-2">
					{skillsMatched.map((s, i) => (
						<span
							key={i}
							className={cn(
								'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium',
								s.relevance === 'core'
									? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
									: 'border-border bg-secondary text-foreground'
							)}
						>
							<CheckCircle size={11} weight="fill" className="shrink-0" />
							{s.skill}
						</span>
					))}
				</div>
			</div>

			{/* Actions */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
					<div className="flex items-center gap-2">
						<Path size={16} weight="duotone" className="text-primary" />
						<h3 className="text-sm font-semibold text-foreground">Learning Roadmap</h3>
					</div>
					<p className="text-xs text-muted-foreground">
						Get a personalized 4-week study plan to close your skill gaps.
					</p>
					{hasRoadmap && roadmapId ? (
						<Button
							variant="outline"
							size="sm"
							className="gap-2 self-start"
							onClick={() => router.push(`/roadmap/${roadmapId}`)}
							id="btn-view-roadmap"
						>
							View Roadmap <ArrowRight size={13} />
						</Button>
					) : (
						<Button
							size="sm"
							className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/90"
							onClick={generateRoadmap}
							disabled={isGeneratingRoadmap}
							id="btn-generate-roadmap"
						>
							{isGeneratingRoadmap ? (
								<>
									<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{' '}
									Generating...
								</>
							) : (
								<>
									<Path size={13} weight="fill" /> Generate Roadmap
								</>
							)}
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
					<div className="flex items-center gap-2">
						<ChatDots size={16} weight="duotone" className="text-primary" />
						<h3 className="text-sm font-semibold text-foreground">Interview Prep</h3>
					</div>
					<p className="text-xs text-muted-foreground">
						AI-generated interview questions tailored to your profile and gaps.
					</p>
					{hasInterview && interviewId ? (
						<Button
							variant="outline"
							size="sm"
							className="gap-2 self-start"
							onClick={() => router.push(`/interview/${interviewId}`)}
							id="btn-view-interview"
						>
							View Questions <ArrowRight size={13} />
						</Button>
					) : (
						<Button
							size="sm"
							className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/90"
							onClick={generateInterview}
							disabled={isGeneratingInterview}
							id="btn-generate-interview"
						>
							{isGeneratingInterview ? (
								<>
									<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{' '}
									Generating...
								</>
							) : (
								<>
									<ChatDots size={13} weight="fill" /> Generate Questions
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
