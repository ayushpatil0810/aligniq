import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { Lightning } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
	title: 'Sign in',
};

export default async function AuthPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect('/resumes');
	}

	return (
		<div className="flex min-h-screen bg-background">
			{/* Left panel — branding */}
			<div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-muted/20 p-12">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
						<Lightning size={16} weight="fill" className="text-primary-foreground" />
					</div>
					<span className="text-lg font-semibold tracking-tight text-foreground">AlignIQ</span>
				</div>
				<div className="space-y-6">
					<div>
						<blockquote className="text-2xl font-medium text-foreground leading-snug">
							&ldquo;Know your gaps.
							<br />
							Close them fast.&rdquo;
						</blockquote>
						<p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
							AlignIQ uses AI to analyze your resume against real job descriptions, identify what's
							missing, and give you a personalized plan to get there.
						</p>
					</div>
					<div className="space-y-3">
						{[
							'AI-powered resume parsing & scoring',
							'Semantic gap analysis (not keyword matching)',
							'Personalized 4-week learning roadmaps',
							'Mock interview question generation',
						].map((item) => (
							<div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
								<div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
								{item}
							</div>
						))}
					</div>
				</div>
				<p className="text-xs text-muted-foreground/60">
					© {new Date().getFullYear()} AlignIQ. No credit card required.
				</p>
			</div>

			{/* Right panel — auth form */}
			<div className="flex flex-1 items-center justify-center p-8">
				<AuthForm />
			</div>
		</div>
	);
}
