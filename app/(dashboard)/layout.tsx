import { requireAuth } from '@/server/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar user={session.user} />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background border-none shadow-none m-0 rounded-none">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-10 lg:p-12 scrollbar-hide bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </TooltipProvider>
  );
}
