import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' }[size];
  const text = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }[size];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30', dims)}>
        <Zap className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      <span className={cn('font-bold tracking-tight text-foreground', text)}>
        Volt<span className="text-primary">Share</span>
      </span>
    </div>
  );
}
