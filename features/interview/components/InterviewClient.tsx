'use client';

import { useState } from 'react';
import { ChatDots, Code, Brain, Buildings, CaretDown, Copy, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { InterviewQuestion } from '@/ai/schemas/interview';

interface Props {
  questions: InterviewQuestion[];
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'technical': { label: 'Technical', icon: Code, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  'behavioral': { label: 'Behavioral', icon: Brain, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  'gap-focused': { label: 'Gap-Focused', icon: ChatDots, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  'company-specific': { label: 'Company', icon: Buildings, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-500',
  medium: 'text-amber-500',
  hard: 'text-red-500',
};

const CATEGORIES = ['all', 'technical', 'behavioral', 'gap-focused', 'company-specific'] as const;

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const cat = categoryConfig[q.category];
  const Icon = cat?.icon ?? ChatDots;

  function copyQuestion() {
    navigator.clipboard.writeText(q.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-150 hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-5 text-left"
        id={`question-${q.id}`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
          <div className="mt-2 flex items-center gap-2">
            {cat && (
              <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-medium', cat.color)}>
                <Icon size={10} className="inline mr-1" />{cat.label}
              </span>
            )}
            <span className={cn('text-[10px] font-medium capitalize', difficultyColors[q.difficulty])}>
              {q.difficulty}
            </span>
          </div>
        </div>
        <CaretDown size={14} className={cn('mt-1 shrink-0 text-muted-foreground transition-transform duration-200', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          {q.hint && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/70 mb-1">Hint</p>
              <p className="text-xs text-muted-foreground">{q.hint}</p>
            </div>
          )}
          {q.sampleAnswer && (
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sample Answer Outline</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{q.sampleAnswer}</p>
            </div>
          )}
          <button
            onClick={copyQuestion}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Copy size={12} /> Copy question</>}
          </button>
        </div>
      )}
    </div>
  );
}

export function InterviewClient({ questions }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? questions
    : questions.filter((q) => q.category === activeCategory);

  const countByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'all' ? questions.length : questions.filter((q) => q.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const cfg = cat !== 'all' ? categoryConfig[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all duration-150',
                activeCategory === cat
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
              id={`interview-filter-${cat}`}
            >
              {cfg?.icon && <cfg.icon size={12} />}
              {cat === 'all' ? 'All Questions' : cfg?.label ?? cat}
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                {countByCategory[cat]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {filtered.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} />
        ))}
      </div>
    </div>
  );
}
