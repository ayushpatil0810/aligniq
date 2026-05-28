'use client';

import { useState, useMemo } from 'react';
import { JobCard } from './JobCard';
import { MagnifyingGlass, Briefcase } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { JobDescription } from '@/db/schema';

const CATEGORIES = [
	'all',
	'frontend',
	'backend',
	'fullstack',
	'mobile',
	'devops',
	'data',
	'ai',
	'design',
] as const;
const LEVELS = ['all', 'intern', 'junior', 'mid', 'senior', 'staff'] as const;

interface Props {
	jobs: JobDescription[];
}

export function JobFilter({ jobs }: Props) {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string>('all');
	const [level, setLevel] = useState<string>('all');

	const filtered = useMemo(() => {
		return jobs.filter((j) => {
			const q = query.trim().toLowerCase();
			const matchesSearch = q === '' || (j.title?.toLowerCase() || '').includes(q);

			const matchesCategory = category === 'all' || (j.category?.toLowerCase() || '') === category;
			const matchesLevel = level === 'all' || (j.level?.toLowerCase() || '') === level;

			return matchesSearch && matchesCategory && matchesLevel;
		});
	}, [jobs, query, category, level]);

	const hasActiveFilters = query !== '' || category !== 'all' || level !== 'all';

	function resetFilters() {
		setQuery('');
		setCategory('all');
		setLevel('all');
	}

	return (
		<div className="space-y-6">
			{/* Filters Bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center p-1 border-b border-border/50 pb-4">
				<div className="relative flex-1">
					<MagnifyingGlass
						size={15}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder="Search roles, companies..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="h-9 pl-9 text-sm shadow-none rounded-md bg-transparent border-border"
						id="job-search-input"
					/>
				</div>
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger className="h-9 w-full sm:w-[140px] text-xs font-medium capitalize shadow-none border-border bg-transparent">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((cat) => (
								<SelectItem key={cat} value={cat} className="text-xs capitalize">
									{cat === 'all' ? 'All Categories' : cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={level} onValueChange={setLevel}>
						<SelectTrigger className="h-9 w-full sm:w-[130px] text-xs font-medium capitalize shadow-none border-border bg-transparent">
							<SelectValue placeholder="Level" />
						</SelectTrigger>
						<SelectContent>
							{LEVELS.map((lvl) => (
								<SelectItem key={lvl} value={lvl} className="text-xs capitalize">
									{lvl === 'all' ? 'All Levels' : lvl}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={resetFilters}
							className="h-9 text-xs text-muted-foreground hover:text-foreground px-2"
						>
							Reset
						</Button>
					)}
				</div>
			</div>

			{/* Results Header */}
			<div className="flex items-center justify-between">
				<p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
					{filtered.length} result{filtered.length !== 1 ? 's' : ''}
				</p>
			</div>

			{/* Results Grid */}
			{filtered.length === 0 ? (
				<EmptyState
					icon={<Briefcase size={20} />}
					title="No jobs match your filters"
					description="Try adjusting your search or filter criteria."
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((job) => (
						<JobCard key={job.id} job={job} />
					))}
				</div>
			)}
		</div>
	);
}
