'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getAiHeaders } from '@/lib/utils/ai-config';
import { useAiCheck } from '@/lib/hooks/useAiCheck';
import { ChartBar, ArrowRight, Briefcase, PencilSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Job {
	id: string;
	title: string;
	level: string;
	category: string;
}

interface Props {
	resumeId: string;
	jobs: Job[];
}

const levelColors: Record<string, string> = {
	intern: 'bg-slate-500/10 text-slate-500',
	junior: 'bg-emerald-500/10 text-emerald-500',
	mid: 'bg-blue-500/10 text-blue-500',
	senior: 'bg-violet-500/10 text-violet-500',
	staff: 'bg-orange-500/10 text-orange-500',
	principal: 'bg-red-500/10 text-red-500',
};

export function ResumeAnalyzeClient({ resumeId, jobs }: Props) {
	const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const [customJobTitle, setCustomJobTitle] = useState('');
	const [customJobDescription, setCustomJobDescription] = useState('');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const router = useRouter();
	const { checkAiKey, AiKeyModal } = useAiCheck();

	async function handleAnalyze() {
		if (activeTab === 'library' && !selectedJobId) return;
		if (activeTab === 'custom' && (!customJobTitle.trim() || !customJobDescription.trim())) {
			toast.error('Please provide both title and description for the custom job.');
			return;
		}

		if (!checkAiKey()) return;

		setIsAnalyzing(true);
		try {
			const payload: any = { resumeId };
			if (activeTab === 'library') {
				payload.jobId = selectedJobId;
			} else {
				payload.customJob = {
					title: customJobTitle.trim(),
					description: customJobDescription.trim(),
				};
			}

			const { data } = await axios.post('/api/analysis', payload, { headers: getAiHeaders() });

			let currentAnalysis = data;

			if (currentAnalysis.status === 'processing') {
				toast.info('AI is analyzing the match... this may take up to a minute.');

				while (currentAnalysis.status === 'processing') {
					await new Promise((resolve) => setTimeout(resolve, 3000));
					const { data: pollData } = await axios.get(`/api/analysis/${currentAnalysis.id}`, {
						headers: getAiHeaders(),
					});
					currentAnalysis = pollData.analysis;
				}
			}

			if (currentAnalysis.status === 'failed') {
				throw new Error('AI match analysis failed. Please try again.');
			}

			toast.success(`Analysis complete! Match score: ${currentAnalysis.matchScore}%`);
			router.push(`/analysis/${currentAnalysis.id}`);
		} catch (err) {
			const message = axios.isAxiosError(err)
				? (err.response?.data?.error ?? 'Analysis failed')
				: err instanceof Error
					? err.message
					: 'Analysis failed';
			toast.error(message);
		} finally {
			setIsAnalyzing(false);
		}
	}

	const isAnalyzeDisabled =
		isAnalyzing ||
		(activeTab === 'library' && !selectedJobId) ||
		(activeTab === 'custom' && (!customJobTitle.trim() || customJobDescription.trim().length < 10));

	return (
		<div className="space-y-4">
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'custom')} className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50">
					<TabsTrigger value="library" className="text-xs data-[state=active]:bg-background">
						<Briefcase size={14} className="mr-2" />
						Job Library
					</TabsTrigger>
					<TabsTrigger value="custom" className="text-xs data-[state=active]:bg-background">
						<PencilSimple size={14} className="mr-2" />
						Custom Job
					</TabsTrigger>
				</TabsList>

				<TabsContent value="library" className="mt-4 outline-none">
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto scrollbar-hide pr-1">
						{jobs.map((job) => (
							<button
								key={job.id}
								onClick={() => setSelectedJobId(job.id === selectedJobId ? null : job.id)}
								className={cn(
									'flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all duration-150 cursor-pointer',
									selectedJobId === job.id
										? 'border-primary bg-primary/5'
										: 'border-border bg-background hover:border-primary/30 hover:bg-accent/30'
								)}
								id={`job-select-${job.id}`}
							>
								<p className="text-xs font-medium text-foreground leading-tight">{job.title}</p>
								<div className="flex gap-1.5">
									<span
										className={cn(
											'rounded px-1.5 py-0.5 text-[10px] font-medium capitalize',
											levelColors[job.level] ?? 'bg-muted text-muted-foreground'
										)}
									>
										{job.level}
									</span>
									<span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
										{job.category}
									</span>
								</div>
							</button>
						))}
					</div>
				</TabsContent>

				<TabsContent value="custom" className="mt-4 outline-none space-y-4">
					<div className="space-y-2">
						<Label htmlFor="custom-job-title" className="text-xs font-medium text-foreground">
							Job Title
						</Label>
						<Input
							id="custom-job-title"
							placeholder="e.g. Senior Frontend Developer"
							value={customJobTitle}
							onChange={(e) => setCustomJobTitle(e.target.value)}
							className="h-9 text-sm shadow-none rounded-md bg-transparent border-border"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="custom-job-desc" className="text-xs font-medium text-foreground">
							Job Description
						</Label>
						<Textarea
							id="custom-job-desc"
							placeholder="Paste the full job description here..."
							value={customJobDescription}
							onChange={(e) => setCustomJobDescription(e.target.value)}
							className="min-h-[160px] text-sm shadow-none rounded-md bg-transparent border-border resize-none"
						/>
						<p className="text-[11px] text-muted-foreground">
							Include requirements and responsibilities for better analysis.
						</p>
					</div>
				</TabsContent>
			</Tabs>

			<div className="flex items-center justify-between border-t border-border pt-4">
				<p className="text-xs text-muted-foreground">
					{activeTab === 'library'
						? selectedJobId
							? `Selected: ${jobs.find((j) => j.id === selectedJobId)?.title}`
							: 'Select a job above to run analysis'
						: 'Provide custom job details to analyze'}
				</p>
				<Button
					onClick={handleAnalyze}
					disabled={isAnalyzeDisabled}
					className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
					id="btn-run-analysis"
				>
					{isAnalyzing ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
							Analyzing...
						</>
					) : (
						<>
							<ChartBar size={15} weight="fill" /> Run Analysis <ArrowRight size={13} />
						</>
					)}
				</Button>
			</div>
			<AiKeyModal />
		</div>
	);
}
