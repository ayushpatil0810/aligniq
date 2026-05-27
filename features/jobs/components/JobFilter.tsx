'use client';

import { useState, useMemo } from 'react';
import { JobCard } from './JobCard';
import { MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { Briefcase } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { JobDescription } from '@/db/schema';

const CATEGORIES = ['all', 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'ai', 'design'] as const;
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
      const matchesQuery =
        !query ||
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.company.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || j.category === category;
      const matchesLevel = level === 'all' || j.level === level;
      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [jobs, query, category, level]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles, companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
            id="job-search-input"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelSimple size={14} className="text-muted-foreground shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-150',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              id={`filter-category-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-150',
              level === lvl
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
            id={`filter-level-${lvl}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={20} />}
          title="No jobs match your filters"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
