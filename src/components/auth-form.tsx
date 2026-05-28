'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightning, Eye, EyeSlash } from '@phosphor-icons/react';

type Mode = 'signin' | 'signup';

export function AuthForm() {
	const router = useRouter();
	const [mode, setMode] = useState<Mode>('signin');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [form, setForm] = useState({ name: '', email: '', password: '' });
	const [error, setError] = useState('');

	function updateField(field: string, value: string) {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError('');
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			if (mode === 'signup') {
				const { error: err } = await authClient.signUp.email({
					email: form.email,
					password: form.password,
					name: form.name,
					callbackURL: '/resumes',
				});
				if (err) throw new Error(err.message);
				toast.success('Account created! Welcome to AlignIQ.');
				router.push('/resumes');
			} else {
				const { error: err } = await authClient.signIn.email({
					email: form.email,
					password: form.password,
					callbackURL: '/resumes',
				});
				if (err) throw new Error(err.message);
				toast.success('Signed in successfully');
				router.push('/resumes');
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Something went wrong';
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-[380px] animate-fade-in">
			{/* Header */}
			<div className="mb-8 text-center">
				<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
					<Lightning size={20} weight="fill" className="text-primary-foreground" />
				</div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{mode === 'signin' ? 'Welcome back' : 'Create account'}
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					{mode === 'signin'
						? 'Sign in to your AlignIQ account'
						: 'Start analyzing your placement readiness'}
				</p>
			</div>

			{/* Email Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				{mode === 'signup' && (
					<div className="space-y-1.5">
						<Label htmlFor="name" className="text-sm font-medium">
							Full name
						</Label>
						<Input
							id="name"
							type="text"
							placeholder="John Doe"
							value={form.name}
							onChange={(e) => updateField('name', e.target.value)}
							required={mode === 'signup'}
							className="h-10 border-border bg-background"
							autoComplete="name"
						/>
					</div>
				)}

				<div className="space-y-1.5">
					<Label htmlFor="email" className="text-sm font-medium">
						Email address
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={form.email}
						onChange={(e) => updateField('email', e.target.value)}
						required
						className="h-10 border-border bg-background"
						autoComplete="email"
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password" className="text-sm font-medium">
						Password
					</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
							value={form.password}
							onChange={(e) => updateField('password', e.target.value)}
							required
							minLength={mode === 'signup' ? 8 : undefined}
							className="h-10 border-border bg-background pr-10"
							autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							tabIndex={-1}
						>
							{showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</div>

				{error && (
					<p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive border border-destructive/20">
						{error}
					</p>
				)}

				<Button
					type="submit"
					className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
					disabled={isLoading}
					id="btn-auth-submit"
				>
					{isLoading ? (
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
							{mode === 'signin' ? 'Signing in...' : 'Creating account...'}
						</div>
					) : (
						<>{mode === 'signin' ? 'Sign in' : 'Create account'}</>
					)}
				</Button>
			</form>

			<p className="mt-5 text-center text-sm text-muted-foreground">
				{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
				<button
					onClick={() => {
						setMode(mode === 'signin' ? 'signup' : 'signin');
						setError('');
					}}
					className="font-medium text-primary hover:text-primary/80 transition-colors"
					id="btn-auth-toggle"
				>
					{mode === 'signin' ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>
	);
}
