import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/hooks/useRouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, Dot } from '@/components/StatusBadge';
import { Zap, Receipt, Search, Filter } from 'lucide-react';
import { getSessions, getPaymentForSession } from '@/services/db';
import { formatCurrency, formatEnergy, formatDurationShort, formatDateShort } from '@/utils/format';
import type { PaymentStatus } from '@/types';

type FilterType = 'all' | 'paid' | 'pending';

export function HistoryPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');

  if (!user) return null;

  let sessions = getSessions().filter((s) => s.userId === user.id);
  if (user.role === 'owner') sessions = getSessions();

  const payStatus = (id: string): PaymentStatus =>
    getPaymentForSession(id)?.status === 'paid' ? 'paid' : 'pending';

  const filtered = sessions.filter((s) => {
    const ps = payStatus(s.id);
    if (filter === 'paid' && ps !== 'paid') return false;
    if (filter === 'pending' && ps !== 'pending') return false;
    if (query && !s.chargerName.toLowerCase().includes(query.toLowerCase()) && !s.id.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalEnergy = filtered.reduce((a, s) => a + s.energyConsumed, 0);
  const totalCost = filtered.reduce((a, s) => a + s.totalCost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Charging History</h1>
        <p className="text-sm text-muted-foreground">All your past charging sessions.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Sessions</p>
          <p className="mt-1 text-2xl font-bold">{filtered.length}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total Energy</p>
          <p className="mt-1 text-2xl font-bold text-accent">{formatEnergy(totalEnergy)}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(totalCost)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['all', 'paid', 'pending'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search charger or session..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table (desktop) */}
      <Card className="hidden border-border bg-card p-0 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Charger</th>
              <th className="px-5 py-3 font-medium">Energy</th>
              <th className="px-5 py-3 font-medium">Duration</th>
              <th className="px-5 py-3 font-medium">Cost</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No charging history yet.</td></tr>
            ) : (
              filtered.map((s) => {
                const ps = payStatus(s.id);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3">{formatDateShort(s.startTime)}</td>
                    <td className="px-5 py-3 font-medium">{s.chargerName}</td>
                    <td className="px-5 py-3">{formatEnergy(s.energyConsumed)}</td>
                    <td className="px-5 py-3">{formatDurationShort(s.durationSec)}</td>
                    <td className="px-5 py-3 font-semibold">{formatCurrency(s.totalCost)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={ps === 'paid' ? 'success' : 'warning'}>
                        <Dot className={ps === 'paid' ? 'bg-accent' : 'bg-warning'} /> {ps === 'paid' ? 'Paid' : 'Pending'}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate('bill', { sessionId: s.id })}>
                        <Receipt className="h-3.5 w-3.5" /> Bill
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Cards (mobile) */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <Card className="border-border bg-card p-8 text-center">
            <Zap className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No charging history yet.</p>
          </Card>
        ) : (
          filtered.map((s) => {
            const ps = payStatus(s.id);
            return (
              <Card key={s.id} className="border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{s.chargerName}</p>
                    <p className="text-xs text-muted-foreground">{formatDateShort(s.startTime)} · {formatDurationShort(s.durationSec)}</p>
                  </div>
                  <StatusBadge status={ps === 'paid' ? 'success' : 'warning'}>
                    {ps === 'paid' ? 'Paid' : 'Pending'}
                  </StatusBadge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{formatEnergy(s.energyConsumed)}</span>
                  </div>
                  <span className="font-bold text-primary">{formatCurrency(s.totalCost)}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('bill', { sessionId: s.id })}>
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> View Bill
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
