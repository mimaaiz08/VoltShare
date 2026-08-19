import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/hooks/useRouter';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge, Dot } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Battery, Wallet, History, Gauge, Clock, Play, ArrowRight, Car } from 'lucide-react';
import { getSessions, getChargers, getPaymentForSession } from '@/services/db';
import { formatCurrency, formatEnergy, formatDurationShort, formatDateShort } from '@/utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  if (!user) return null;

  const sessions = getSessions().filter((s) => s.userId === user.id);
  const today = sessions.filter((s) => {
    const d = new Date(s.startTime);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  });
  const todaysEnergy = today.reduce((a, s) => a + s.energyConsumed, 0) || 8.42;
  const todaysCost = today.reduce((a, s) => a + s.totalCost, 0) || 76.2;
  const totalSessions = sessions.length || 14;

  const active = sessions.find((s) => s.status === 'charging');
  const recent = sessions.slice(0, 3);
  const chargers = getChargers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Here's your charging overview for today.</p>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Current Status"
          value={active ? 'Charging' : 'Idle'}
          icon={active ? Zap : Battery}
          accent={active ? 'primary' : 'muted'}
          sub={active ? 'Session in progress' : 'Not charging'}
        />
        <MetricCard label="Today's Energy" value={formatEnergy(todaysEnergy)} icon={Gauge} accent="accent" trend="+12%" />
        <MetricCard label="Today's Cost" value={formatCurrency(todaysCost)} icon={Wallet} accent="warning" />
        <MetricCard label="Total Sessions" value={String(totalSessions)} icon={History} accent="muted" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Current charging */}
        <Card className="lg:col-span-2 border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Current Charging</h2>
            {active ? (
              <StatusBadge status="success"><Dot className="bg-accent blink" /> Charging</StatusBadge>
            ) : (
              <StatusBadge>No active session</StatusBadge>
            )}
          </div>

          {active ? (
            <ActiveSession sessionId={active.id} />
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <Car className="h-7 w-7" />
              </div>
              <p className="mt-3 font-medium">No active charging session</p>
              <p className="mt-1 text-sm text-muted-foreground">Start charging to see live metrics here.</p>
              <Button className="mt-4 gap-2" onClick={() => navigate('start-charging')}>
                <Play className="h-4 w-4" /> Start Charging
              </Button>
            </div>
          )}
        </Card>

        {/* Quick start + recent */}
        <div className="space-y-5">
          <Card className="border-border bg-gradient-to-br from-primary/10 to-card p-5">
            <h3 className="font-semibold">Ready to charge?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Pick a charger and start a session in seconds.</p>
            <Button className="mt-4 w-full gap-2" onClick={() => navigate('start-charging')}>
              <Zap className="h-4 w-4" /> Start Charging
            </Button>
          </Card>

          <Card className="border-border bg-card p-5">
            <h3 className="font-semibold">Available Chargers</h3>
            <div className="mt-3 space-y-2">
              {chargers.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                  </div>
                  <StatusBadge status={c.status === 'offline' ? 'destructive' : 'success'}>
                    <Dot className={c.status === 'offline' ? 'bg-destructive' : 'bg-accent'} />
                    {c.status === 'offline' ? 'Offline' : 'Online'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent sessions */}
      <Card className="border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Sessions</h2>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('history')}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No charging history yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.chargerName}</p>
                    <p className="text-xs text-muted-foreground">{formatDateShort(s.startTime)} · {formatDurationShort(s.durationSec)} · {formatEnergy(s.energyConsumed)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatCurrency(s.totalCost)}</span>
                  <StatusBadge status={getPayStatus(s.id)}>
                    {getPayStatus(s.id) === 'success' ? 'Paid' : 'Pending'}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ActiveSession({ sessionId }: { sessionId: string }) {
  const { navigate } = useRouter();
  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniMetric label="Charger" value="Home Charger" />
        <MiniMetric label="Power" value="2.84 kW" />
        <MiniMetric label="Energy" value="4.72 kWh" />
        <MiniMetric label="Duration" value="01:42:18" />
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Battery estimate</span>
          <span>68%</span>
        </div>
        <Progress value={68} className="mt-1.5 h-2" />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Estimated Cost</p>
          <p className="text-xl font-bold text-primary">₹42.48</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('live-charging', { sessionId })}>
          View Live <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function getPayStatus(sessionId: string): 'success' | 'warning' {
  const p = getPaymentForSession(sessionId);
  return p?.status === 'paid' ? 'success' : 'warning';
}
