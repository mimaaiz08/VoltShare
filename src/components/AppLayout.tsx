import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, type Route } from '@/hooks/useRouter';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Zap, History, BarChart3, Settings,
  Plug, Wallet, LogOut, Users, LineChart, ZapOff, Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  route: Route;
  label: string;
  icon: typeof LayoutDashboard;
}

const EV_NAV: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'start-charging', label: 'Start Charging', icon: Zap },
  { route: 'history', label: 'History', icon: History },
  { route: 'analytics', label: 'Analytics', icon: BarChart3 },
  { route: 'settings', label: 'Settings', icon: Settings },
];

const OWNER_NAV: NavItem[] = [
  { route: 'owner-dashboard', label: 'Overview', icon: LayoutDashboard },
  { route: 'manage-chargers', label: 'Chargers', icon: Plug },
  { route: 'owner-analytics', label: 'Analytics', icon: LineChart },
  { route: 'history', label: 'Sessions', icon: History },
  { route: 'settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const { route, navigate } = useRouter();
  if (!user) return <>{children}</>;

  const isOwner = user.role === 'owner';
  const nav = isOwner ? OWNER_NAV : EV_NAV;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <button onClick={() => navigate(isOwner ? 'owner-dashboard' : 'dashboard')}>
          <Logo />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = route === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4.5 w-4.5" strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-4">
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{user.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {isOwner ? 'Owner' : 'EV User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-xs"
            onClick={() => switchRole(isOwner ? 'ev' : 'owner')}
          >
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Switch to {isOwner ? 'EV User' : 'Owner'}
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        {SidebarContent}
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile + presentation button) */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              {nav.find((n) => n.route === route)?.label ?? 'VoltShare'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning sm:flex">
              <ZapOff className="h-3 w-3" /> Demo Mode
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('presentation')}
              className="gap-1.5"
            >
              <Monitor className="h-3.5 w-3.5" /> Present
            </Button>
          </div>
        </header>

        <main className="px-4 pb-24 pt-4 lg:px-8 lg:pb-8">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {nav.map((item) => {
            const active = route === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={2} />
                {item.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
