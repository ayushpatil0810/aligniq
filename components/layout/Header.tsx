import { ThemeToggle } from './ThemeToggle';
import { Bell } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/server/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';

export async function Header() {
  await requireAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-8 lg:px-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent/50 -ml-2 h-8 w-8" />
        {/* Breadcrumb placeholder — filled by individual pages */}
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
