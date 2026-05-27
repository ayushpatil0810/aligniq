'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquaresFour,
  FileText,
  Briefcase,
  ChartBar,
  Path,
  ChatDots,
  Gear,
  Lightning,
  SignOut,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { navItems, bottomNavItems } from '@/config/nav';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const iconMap: Record<string, React.ElementType> = {
  SquaresFour,
  FileText,
  Briefcase,
  ChartBar,
  Path,
  ChatDots,
  Gear,
};

function NavItem({
  href,
  icon: iconName,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const Icon = iconMap[iconName];
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={label}
        className={cn(
          "h-9 gap-3 rounded-md px-3 text-sm transition-all duration-150",
          isActive
            ? "bg-accent/50 text-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
        )}
      >
        <Link href={href}>
          {Icon && (
            <Icon
              size={18}
              weight={isActive ? 'fill' : 'regular'}
              className="shrink-0"
            />
          )}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function Sidebar({ user }: { user: any }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/auth');
          toast.success('Signed out successfully');
        },
      },
    });
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-border bg-sidebar group">
      <SidebarHeader className="flex flex-col gap-4 p-4 pb-2 border-b border-border/50">
        {/* Logo */}
        <div className="flex h-8 items-center gap-2.5 px-2">
          <span className="text-[15px] font-bold tracking-widest text-foreground uppercase truncate group-data-[collapsible=icon]:hidden">
            AlignIQ.
          </span>
          <span className="text-[15px] font-bold tracking-widest text-foreground uppercase hidden group-data-[collapsible=icon]:block w-full text-center">
            A.
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/30 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 shrink-0 rounded-md">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
            <AvatarFallback className="text-[11px] font-semibold bg-foreground/10 text-foreground rounded-md">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-foreground leading-tight">
              {user?.name || 'User'}
            </span>
            <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">
              {user?.email?.split('@')[0]}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-1 no-scrollbar">
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu className="gap-0.5">
          {bottomNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              className="h-9 gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 cursor-pointer"
            >
              <SignOut size={18} className="shrink-0" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
