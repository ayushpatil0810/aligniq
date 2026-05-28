'use client';

import * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { navItems, bottomNavItems } from '@/config/nav';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
	SquaresFour,
	FileText,
	Briefcase,
	ChartBar,
	Path,
	ChatDots,
	Gear,
} from '@phosphor-icons/react';
import Link from 'next/link';

const iconMap: Record<string, any> = {
	SquaresFour,
	FileText,
	Briefcase,
	ChartBar,
	Path,
	ChatDots,
	Gear,
};

export function AppSidebar({
	user,
	...props
}: React.ComponentProps<typeof Sidebar> & { user: any }) {
	// Map our config to nav-main format
	const mappedNavMain = navItems.map((item) => {
		const Icon = iconMap[item.icon];
		return {
			title: item.label,
			url: item.href,
			icon: Icon ? <Icon /> : undefined,
			isActive: false, // handled in NavMain
		};
	});

	const mappedBottomNav = bottomNavItems.map((item) => {
		const Icon = iconMap[item.icon];
		return {
			title: item.label,
			url: item.href,
			icon: Icon ? <Icon /> : undefined,
		};
	});

	const mappedUser = {
		name: user?.name || 'User',
		email: user?.email || 'user@example.com',
		avatar: user?.image || '',
	};

	return (
		<Sidebar collapsible="icon" variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/resumes">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
									<span className="font-bold text-lg leading-none">A</span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold tracking-widest uppercase">AlignIQ.</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={mappedNavMain} />
				{/* You can add NavSecondary or NavDocuments here if needed */}
			</SidebarContent>

			<SidebarFooter>
				<div className="mb-2">
					<NavMain items={mappedBottomNav} />
				</div>
				<NavUser user={mappedUser} />
			</SidebarFooter>
		</Sidebar>
	);
}
