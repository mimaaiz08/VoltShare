import { useRouter } from '@/hooks/useRouter';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Car, Plug, ArrowRight, ArrowLeft, Zap, Mail } from 'lucide-react';

export function LoginPage() {
  const { navigate } = useRouter();
  const { login } = useAuth();

  const choose = (role: 'ev' | 'owner') => {
    login(role);
    navigate(role === 'owner' ? 'owner-dashboard' : 'dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-glow absolute inset-0 opacity-30" />
      <div className="absolute left-1/2 top-1/3 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-12">
        <button onClick={() => navigate('landing')} className="absolute left-5 top-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <Logo size="lg" />

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Try VoltShare Demo</h1>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Pick a role to explore the platform. No signup needed — this is a fully interactive prototype.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-5 md:grid-cols-2">
          <RoleCard
            icon={Car}
            role="EV User"
            email="demo@voltshare.com"
            name="Arjun Rao"
            desc="Charge your EV, monitor live energy, pay bills, and track history."
            cta="Continue as EV User"
            onClick={() => choose('ev')}
          />
          <RoleCard
            icon={Plug}
            role="Charger Owner"
            email="owner@voltshare.com"
            name="Priya Shenoy"
            desc="Manage chargers, view active sessions, revenue, and analytics."
            cta="Continue as Charger Owner"
            onClick={() => choose('owner')}
          />
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Demo accounts are pre-filled — just click a role to enter.
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, role, email, name, desc, cta, onClick }: {
  icon: typeof Car; role: string; email: string; name: string; desc: string; cta: string; onClick: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/5 transition-colors group-hover:bg-primary/10" />
      <div className="relative">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{role}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-xs">
          <p className="text-muted-foreground">{email}</p>
          <p className="mt-0.5 font-medium text-foreground">{name}</p>
        </div>
        <Button className="mt-4 w-full gap-2" onClick={onClick}>
          <Zap className="h-4 w-4" /> {cta}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
