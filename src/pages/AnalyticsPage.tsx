import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend,
} from 'recharts';
import { Gauge, Wallet, Clock, Zap } from 'lucide-react';
import { getSessions } from '@/services/db';
import { formatCurrency, formatEnergy, formatDurationShort } from '@/utils/format';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AnalyticsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const sessions = getSessions().filter((s) => s.userId === user.id && s.status === 'completed');

  // Build last 7 days
  const now = new Date();
  const weekData = DAYS.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const daySessions = sessions.filter((s) => {
      const sd = new Date(s.startTime);
      return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth();
    });
    const energy = daySessions.reduce((a, s) => a + s.energyConsumed, 0);
    const cost = daySessions.reduce((a, s) => a + s.totalCost, 0);
    // fallback sample data if empty
    const sample = [4.2, 7.1, 5.8, 8.2, 6.4, 9.1, 4.7][i];
    return {
      day,
      energy: +(energy || sample).toFixed(2),
      cost: +(cost || (sample * 9)).toFixed(2),
    };
  });

  const weeklyEnergy = weekData.reduce((a, d) => a + d.energy, 0);
  const weeklySpending = weekData.reduce((a, d) => a + d.cost, 0);
  const avgSession = sessions.length
    ? sessions.reduce((a, s) => a + s.durationSec, 0) / sessions.length
    : 6480;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your charging patterns over the last 7 days.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Weekly Energy" value={formatEnergy(weeklyEnergy)} icon={Gauge} accent="accent" />
        <MetricCard label="Weekly Spending" value={formatCurrency(weeklySpending)} icon={Wallet} accent="primary" />
        <MetricCard label="Average Session" value={formatDurationShort(avgSession)} icon={Clock} accent="muted" />
      </div>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Energy Consumption (7 days)</h2>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160 70% 42%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(160 70% 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 16%)" />
              <XAxis dataKey="day" stroke="hsl(215 20% 65%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)', borderRadius: 8, color: 'hsl(210 40% 98%)' }}
                formatter={(v: number) => [`${v} kWh`, 'Energy']}
              />
              <Area type="monotone" dataKey="energy" stroke="hsl(160 70% 42%)" strokeWidth={2} fill="url(#energyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Cost Over Time (7 days)</h2>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 16%)" />
              <XAxis dataKey="day" stroke="hsl(215 20% 65%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)', borderRadius: 8, color: 'hsl(210 40% 98%)' }}
                formatter={(v: number) => [`₹${v}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="hsl(189 94% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
