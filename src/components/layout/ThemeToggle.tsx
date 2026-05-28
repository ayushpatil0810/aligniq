'use client';

import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-8 w-8">
				<span className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8 text-muted-foreground hover:text-foreground"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			aria-label="Toggle theme"
		>
			{theme === 'dark' ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />}
		</Button>
	);
}
