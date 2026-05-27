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
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {Icon && (
        <Icon
          size={18}
          weight={isActive ? 'fill' : 'regular'}
          className="shrink-0 transition-colors duration-150"
        />
      )}
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

export function Sidebar() {
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

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Lightning size={15} weight="fill" className="text-primary-foreground" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          AlignIQ
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 scrollbar-hide">
        <div className="mb-1">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Menu
          </p>
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-border p-3">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
        >
          <SignOut size={18} className="shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
