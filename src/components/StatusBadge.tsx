import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

const variants: Record<Variant, string> = {
  default: 'bg-muted text-muted-foreground border-border',
  success: 'bg-accent/10 text-accent border-accent/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-primary/10 text-primary border-primary/30',
};

export function StatusBadge({ status, className, children }: { status?: Variant; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', variants[status ?? 'default'], className)}>
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', className)} />;
}
