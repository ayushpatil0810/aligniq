import { cn } from '@/lib/utils';

interface SkeletonCardProps {
	className?: string;
	lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
	return (
		<div className={cn('rounded-xl border border-border bg-card p-5 animate-pulse', className)}>
			<div className="h-4 w-1/3 rounded-md bg-muted mb-3" />
			{Array.from({ length: lines }).map((_, i) => (
				<div
					key={i}
					className="h-3 rounded-md bg-muted mb-2"
					style={{ width: `${90 - i * 15}%` }}
				/>
			))}
		</div>
	);
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
	return (
		<div className={cn('space-y-3', className)}>
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</div>
	);
}

export function SkeletonStat({ className }: { className?: string }) {
	return (
		<div className={cn('rounded-xl border border-border bg-card p-5 animate-pulse', className)}>
			<div className="h-3 w-20 rounded-md bg-muted mb-4" />
			<div className="h-8 w-16 rounded-md bg-muted mb-2" />
			<div className="h-2.5 w-24 rounded-md bg-muted" />
		</div>
	);
}
