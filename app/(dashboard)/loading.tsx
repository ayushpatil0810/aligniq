import { SpinnerIcon } from '@phosphor-icons/react/dist/ssr';

export default function DashboardLoading() {
	return (
		<div className="flex h-full min-h-[400px] w-full items-center justify-center animate-fade-in">
			<div className="flex flex-col items-center gap-4 text-muted-foreground/60">
				<SpinnerIcon className="h-8 w-8 animate-spin" />
				<p className="text-sm font-medium tracking-wide uppercase">Loading...</p>
			</div>
		</div>
	);
}
