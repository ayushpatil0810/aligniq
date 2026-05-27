import { requireAuth } from '@/server/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { User, EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react/dist/ssr';

export default async function SettingsPage() {
  const session = await requireAuth();
  const user = session.user;

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences."
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User size={15} weight="duotone" className="text-primary" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Full Name</p>
            <p className="text-sm text-foreground font-medium">{user.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <EnvelopeSimple size={11} /> Email
            </p>
            <p className="text-sm text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <ShieldCheck size={11} /> Email Verified
            </p>
            <p className="text-sm text-foreground">
              {user.emailVerified ? (
                <span className="text-emerald-500">Verified ✓</span>
              ) : (
                <span className="text-amber-500">Not verified</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Account Created</p>
            <p className="text-sm text-foreground">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
