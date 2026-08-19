import { useState, useEffect } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Zap, Gauge, Activity, Battery, Clock, Wallet, Square,
  ArrowLeft, Thermometer, Cpu,
} from 'lucide-react';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';
import { getSession, updateSession, getCharger, updateCharger } from '@/services/db';
import { formatCurrency, formatEnergy, formatPower, formatDuration } from '@/utils/format';
import { toast } from 'sonner';
import type { LiveMetrics } from '@/types';

export function LiveChargingPage() {
  const { params, navigate } = useRouter();
  const { user } = useAuth();
  const session = params.sessionId ? getSession(params.sessionId) : undefined;

  const tariff = session?.tariff ?? 9;
  const serviceFee = session?.serviceFee ?? 2;
  const { metrics, running, start, stop } = useChargingSimulation(tariff, serviceFee);

  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (session && !running && !stopped) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div>
          <p className="text-lg font-semibold">No active session</p>
          <Button className="mt-4" onClick={() => navigate('start-charging')}>Start Charging</Button>
        </div>
      </div>
    );
  }

  const handleStop = () => {
    const final: LiveMetrics = stop();
    const energyCost = +(final.energy * tariff).toFixed(2);
    const totalCost = +(energyCost + serviceFee).toFixed(2);

    updateSession(session.id, {
      endTime: Date.now(),
      durationSec: final.durationSec,
      energyConsumed: +final.energy.toFixed(3),
      energyCost,
      totalCost,
      status: 'completed',
    });

    const charger = getCharger(session.chargerId);
    if (charger) {
      updateCharger(charger.id, {
        totalEnergy: +(charger.totalEnergy + final.energy).toFixed(2),
        totalSessions: charger.totalSessions + 1,
        status: 'online',
      });
    }

    setStopped(true);
    toast.success('Session saved — bill generated');
    setTimeout(() => navigate('bill', { sessionId: session.id }), 700);
  };

  const batteryPct = Math.min(95, Math.round(40 + metrics.energy * 8));

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </button>

      {/* Hero charging card */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-[80px]" />
        <div className="relative flex flex-col items-center text-center">
          <div className={`grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground ${running ? 'charge-pulse' : ''}`}>
            <Zap className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {running ? 'CHARGING' : 'SESSION STOPPED'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{session.chargerName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Session ID: {session.id}</p>
        </div>

        {/* Big live cost */}
        <div className="relative mt-6 grid place-items-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Cost</p>
          <p className="text-5xl font-bold text-primary">{formatCurrency(metrics.cost)}</p>
          <p className="mt-1 text-xs text-muted-foreground">at ₹{tariff}/kWh</p>
        </div>

        {/* Battery progress */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Battery className="h-3.5 w-3.5" /> Battery estimate</span>
            <span>{batteryPct}%</span>
          </div>
          <Progress value={batteryPct} className="mt-1.5 h-2.5" />
        </div>
      </Card>

      {/* Live metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LiveMetric icon={Activity} label="Power" value={formatPower(metrics.power)} sub="kW" accent="primary" running={running} />
        <LiveMetric icon={Zap} label="Voltage" value={`${metrics.voltage} V`} sub="volts" accent="primary" running={running} />
        <LiveMetric icon={Gauge} label="Current" value={`${metrics.current} A`} sub="amps" accent="primary" running={running} />
        <LiveMetric icon={Battery} label="Energy Consumed" value={formatEnergy(metrics.energy)} sub="kWh" accent="accent" running={running} />
        <LiveMetric icon={Clock} label="Duration" value={formatDuration(metrics.durationSec)} sub="hh:mm:ss" accent="accent" running={running} />
        <LiveMetric icon={Thermometer} label="Temperature" value={`${metrics.temperature}°C`} sub="adapter" accent="warning" running={running} />
      </div>

      {/* Adapter status */}
      <Card className="border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">VoltShare Smart Adapter</p>
              <p className="text-xs text-muted-foreground">Simulated · updates every 2s</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <span className={`h-1.5 w-1.5 rounded-full bg-accent ${running ? 'blink' : ''}`} /> {running ? 'Streaming' : 'Stopped'}
          </span>
        </div>
      </Card>

      {/* Stop button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="destructive"
          size="lg"
          className="gap-2"
          onClick={handleStop}
          disabled={!running}
        >
          <Square className="h-4 w-4" /> Stop Charging
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('dashboard')} disabled={running}>
          <Wallet className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      {!user && <p className="text-center text-xs text-muted-foreground">Sign in to save sessions.</p>}
    </div>
  );
}

function LiveMetric({ icon: Icon, label, value, sub, accent, running }: {
  icon: typeof Zap; label: string; value: string; sub: string;
  accent: 'primary' | 'accent' | 'warning'; running: boolean;
}) {
  const colorMap = { primary: 'text-primary', accent: 'text-accent', warning: 'text-warning' };
  const bgMap = { primary: 'bg-primary/10', accent: 'bg-accent/10', warning: 'bg-warning/10' };
  return (
    <Card className="border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${bgMap[accent]} ${colorMap[accent]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {running && <span className={`h-1.5 w-1.5 rounded-full ${colorMap[accent]} blink`} />}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </Card>
  );
}
