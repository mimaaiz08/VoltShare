import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/hooks/useRouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge, Dot } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import {
  Plug, Zap, Gauge, Wallet, Activity, Plus, ArrowRight,
  MapPin, Power, Users,
} from 'lucide-react';
import { getChargers, getSessions, getPaymentForSession } from '@/services/db';
import { formatCurrency, formatEnergy, formatPower } from '@/utils/format';

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  if (!user) return null;

  const chargers = getChargers().filter((c) => c.ownerId === user.id);
  const sessions = getSessions();
  const activeSessions = sessions.filter((s) => s.status === 'charging');
  const totalEnergy = chargers.reduce((a, c) => a + c.totalEnergy, 0);
  const revenue = sessions
    .filter((s) => getPaymentForSession(s.id)?.status === 'paid')
    .reduce((a, s) => a + s.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Owner Overview</h1>
          <p className="text-sm text-muted-foreground">Monitor your chargers and revenue.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('manage-chargers')}>
          <Plus className="h-4 w-4" /> Add Charger
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Chargers" value={String(chargers.filter((c) => c.status !== 'offline').length)} icon={Plug} accent="primary" />
        <MetricCard label="Active Sessions" value={String(activeSessions.length)} icon={Activity} accent="accent" />
        <MetricCard label="Energy Delivered" value={formatEnergy(totalEnergy)} icon={Gauge} accent="accent" />
        <MetricCard label="Revenue" value={formatCurrency(revenue)} icon={Wallet} accent="warning" trend="+8%" />
      </div>

      {/* Charger status */}
      <Card className="border-border bg-card p-5">
        <h2 className="font-semibold">Charger Status</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {chargers.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plug className="h-4.5 w-4.5" />
                </div>
                <StatusBadge status={c.status === 'offline' ? 'destructive' : 'success'}>
                  <Dot className={c.status === 'offline' ? 'bg-destructive' : 'bg-accent'} />
                  {c.status === 'offline' ? 'Offline' : c.status === 'charging' ? 'Charging' : 'Available'}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm font-semibold">{c.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {c.location}
              </p>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power</span>
                  <span>{formatPower(c.powerRating)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tariff</span>
                  <span>₹{c.tariff}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions</span>
                  <span>{c.totalSessions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active sessions */}
      <Card className="border-border bg-card p-5">
        <h2 className="font-semibold">Active Sessions</h2>
        {activeSessions.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border bg-background/50 py-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No active charging sessions right now.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.userName}</p>
                    <p className="text-xs text-muted-foreground">{s.chargerName} · {formatEnergy(s.energyConsumed)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{formatPower(2.84)}</span>
                  <span className="font-semibold text-primary">{formatCurrency(s.totalCost)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Revenue This Month</h2>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('owner-analytics')}>
            Details <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target: ₹5,000</span>
            <span>{Math.round((revenue / 5000) * 100)}%</span>
          </div>
          <Progress value={Math.min(100, (revenue / 5000) * 100)} className="mt-1.5 h-2" />
        </div>
      </Card>
    </div>
  );
}
