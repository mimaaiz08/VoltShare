import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { Gauge, Wallet, Zap, TrendingUp } from 'lucide-react';
import { getSessions, getPaymentForSession } from '@/services/db';
import { formatCurrency, formatEnergy } from '@/utils/format';

export function OwnerAnalyticsPage() {
  const { user } = useAuth();
  if (!user) return null;
  const sessions = getSessions();
  const paid = sessions.filter((s) => getPaymentForSession(s.id)?.status === 'paid');
  const totalEnergy = sessions.reduce((a, s) => a + s.energyConsumed, 0);
  const revenue = paid.reduce((a, s) => a + s.totalCost, 0);

  const weekly = [
    { week: 'Week 1', revenue: 2450, energy: 142 },
    { week: 'Week 2', revenue: 3120, energy: 178 },
    { week: 'Week 3', revenue: 2890, energy: 165 },
    { week: 'Week 4', revenue: 4150, energy: 224 },
  ];

  const daily = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    sessions: Math.floor(3 + Math.random() * 6),
    energy: +(8 + Math.random() * 12).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Owner Analytics</h1>
        <p className="text-sm text-muted-foreground">Revenue, energy delivery, and usage trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Energy Delivered" value={formatEnergy(totalEnergy)} icon={Gauge} accent="accent" trend="+12%" />
        <MetricCard label="Total Revenue" value={formatCurrency(revenue)} icon={Wallet} accent="primary" trend="+8%" />
        <MetricCard label="Total Sessions" value={String(sessions.length)} icon={Zap} accent="muted" />
      </div>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Monthly Revenue</h2>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 16%)" />
              <XAxis dataKey="week" stroke="hsl(215 20% 65%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)', borderRadius: 8, color: 'hsl(210 40% 98%)' }}
                formatter={(v: number) => [`₹${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(189 94% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-5">
        <h2 className="font-semibold">Energy Delivered (Weekly)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 16%)" />
              <XAxis dataKey="week" stroke="hsl(215 20% 65%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)', borderRadius: 8, color: 'hsl(210 40% 98%)' }}
                formatter={(v: number) => [`${v} kWh`, 'Energy']}
              />
              <Line type="monotone" dataKey="energy" stroke="hsl(160 70% 42%)" strokeWidth={2} dot={{ fill: 'hsl(160 70% 42%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-5">
        <h2 className="font-semibold">Daily Usage</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 16%)" />
              <XAxis dataKey="day" stroke="hsl(215 20% 65%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)', borderRadius: 8, color: 'hsl(210 40% 98%)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sessions" name="Sessions" fill="hsl(189 94% 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="energy" name="Energy (kWh)" fill="hsl(160 70% 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
