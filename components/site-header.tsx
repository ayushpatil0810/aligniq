import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Bell } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center justify-between border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-(--header-height) px-4 lg:px-6">
			<div className="flex items-center gap-1">
				<SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
			</div>
			<div className="flex items-center gap-2">
				<ThemeToggle />
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
					aria-label="Notifications"
				>
					<Bell size={16} weight="regular" />
				</Button>
			</div>
		</header>
	);
}
