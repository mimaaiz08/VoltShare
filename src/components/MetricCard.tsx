import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: 'primary' | 'accent' | 'warning' | 'muted';
  trend?: string;
}

const accentMap = {
  primary: 'text-primary bg-primary/10',
  accent: 'text-accent bg-accent/10',
  warning: 'text-warning bg-warning/10',
  muted: 'text-muted-foreground bg-muted',
};

export function MetricCard({ label, value, sub, icon: Icon, accent = 'primary', trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className={cn('grid h-9 w-9 place-items-center rounded-lg', accentMap[accent])}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-accent">
            <ArrowUpRight className="h-3 w-3" />{trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
