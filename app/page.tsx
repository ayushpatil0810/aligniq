import Link from 'next/link';
import { Lightning, ArrowRight, ChartBar, Path, ChatDots, FileText } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

const features = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description: 'AI parses your resume to extract skills, experience, and hidden gaps with precision.',
  },
  {
    icon: ChartBar,
    title: 'Semantic Match Engine',
    description: 'Contextual AI matching — not keyword search. Understands depth, transferability, and relevance.',
  },
  {
    icon: Path,
    title: '4-Week Roadmaps',
    description: 'Personalized learning plans targeting your exact gaps, with resources and daily practices.',
  },
  {
    icon: ChatDots,
    title: 'Interview Simulation',
    description: 'AI-generated questions across Technical, Behavioral, Gap-Focused, and Company-Specific categories.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="flex h-14 items-center justify-between border-b border-border/50 px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Lightning size={15} weight="fill" className="text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">{siteConfig.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" id="btn-signin-nav">
              Sign in
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" id="btn-signup-nav">
              Get started <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
          <Lightning size={12} weight="fill" className="text-primary" />
          <span className="text-xs font-medium text-primary">AI-powered placement intelligence</span>
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Know your gaps.
          <br />
          <span className="text-gradient">Close them fast.</span>
        </h1>

        <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed">
          Upload your resume. Match it against top job descriptions. Get AI-powered gap analysis, a personalized learning roadmap, and mock interview prep — all in one place.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link href="/auth">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6" id="btn-hero-cta">
              Start for free <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline" size="lg" className="h-11 px-6 border-border" id="btn-hero-secondary">
              View demo
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-xs text-muted-foreground/60">
          No credit card required · Instant AI analysis
        </p>
      </main>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/20 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Everything you need to land the role
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Four powerful features. One focused platform.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-all duration-150 hover:border-primary/30"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon size={20} weight="duotone" className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 px-6 py-20 text-center lg:px-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Ready to find your gap?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Get your placement readiness score in under 2 minutes.
        </p>
        <div className="mt-6">
          <Link href="/auth">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8" id="btn-bottom-cta">
              <Lightning size={16} weight="fill" /> Get started free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js, OpenAI, and Drizzle ORM.
        </p>
      </footer>
    </div>
  );
}
