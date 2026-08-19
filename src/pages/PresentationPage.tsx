import { useEffect, useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/Logo';
import { Zap, Gauge, Activity, Clock, Wallet, ArrowLeft, Monitor, X } from 'lucide-react';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';
import { formatCurrency, formatEnergy, formatPower, formatDuration } from '@/utils/format';

export function PresentationPage() {
  const { navigate } = useRouter();
  const { metrics, running, start, stop } = useChargingSimulation(9, 2);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    start();
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExit = () => {
    stop();
    setExiting(true);
    setTimeout(() => navigate('dashboard'), 400);
  };

  const batteryPct = Math.min(95, Math.round(40 + metrics.energy * 8));

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Top bar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
        <Logo size="sm" />
      </div>
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleExit} disabled={exiting}>
          <X className="h-4 w-4" /> Exit
        </Button>
      </div>

      <div className="grid-glow absolute inset-0 opacity-20" />
      <div className="absolute left-1/2 top-1/4 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        {/* Status */}
        <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
          <span className={`h-2 w-2 rounded-full bg-accent ${running ? 'blink' : ''}`} />
          {running ? 'LIVE CHARGING' : 'STOPPED'}
        </div>

        {/* Big bolt */}
        <div className={`mt-8 grid h-28 w-28 place-items-center rounded-full bg-primary text-primary-foreground ${running ? 'charge-pulse' : ''}`}>
          <Zap className="h-14 w-14" strokeWidth={2.5} />
        </div>

        {/* Cost */}
        <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">Current Cost</p>
        <p className="text-6xl font-bold text-primary tabular-nums sm:text-7xl">{formatCurrency(metrics.cost)}</p>
        <p className="mt-1 text-sm text-muted-foreground">at ₹9/kWh</p>

        {/* Metrics row */}
        <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          <BigMetric icon={Activity} label="Power" value={formatPower(metrics.power)} />
          <BigMetric icon={Gauge} label="Energy" value={formatEnergy(metrics.energy)} />
          <BigMetric icon={Clock} label="Duration" value={formatDuration(metrics.durationSec)} />
          <BigMetric icon={Zap} label="Voltage" value={`${metrics.voltage}V`} />
        </div>

        {/* Battery bar */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Battery</span>
            <span>{batteryPct}%</span>
          </div>
          <Progress value={batteryPct} className="mt-1.5 h-3" />
        </div>

        <Button variant="destructive" size="lg" className="mt-10 gap-2" onClick={handleExit}>
          Stop & Exit
        </Button>
      </div>
    </div>
  );
}

function BigMetric({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-5 text-center backdrop-blur">
      <Icon className="mx-auto h-6 w-6 text-primary" />
      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
