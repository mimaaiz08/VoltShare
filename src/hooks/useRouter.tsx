import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Route =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'start-charging'
  | 'live-charging'
  | 'history'
  | 'analytics'
  | 'bill'
  | 'owner-dashboard'
  | 'owner-analytics'
  | 'manage-chargers'
  | 'settings'
  | 'presentation';

interface RouterState {
  route: Route;
  params: Record<string, string>;
  navigate: (route: Route, params?: Record<string, string>) => void;
}

const RouterContext = createContext<RouterState | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((r: Route, p: Record<string, string> = {}) => {
    setRoute(r);
    setParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ route, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
