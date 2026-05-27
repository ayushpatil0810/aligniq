import { ThemeToggle } from './ThemeToggle';
import { Bell } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { requireAuth } from '@/server/auth';

export async function Header() {
  const session = await requireAuth();
  const user = session.user;
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* Breadcrumb placeholder — filled by individual pages */}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={16} weight="regular" />
        </Button>
        <Avatar className="ml-1 h-7 w-7 cursor-pointer">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
          <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
