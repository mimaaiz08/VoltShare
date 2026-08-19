import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { RouterProvider, useRouter } from '@/hooks/useRouter';
import { AppLayout } from '@/components/AppLayout';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StartChargingPage } from '@/pages/StartChargingPage';
import { LiveChargingPage } from '@/pages/LiveChargingPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { BillPage } from '@/pages/BillPage';
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage';
import { OwnerAnalyticsPage } from '@/pages/OwnerAnalyticsPage';
import { ManageChargersPage } from '@/pages/ManageChargersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PresentationPage } from '@/pages/PresentationPage';

function Router() {
  const { route } = useRouter();
  const { user } = useAuth();

  // Public routes
  if (route === 'landing') return <LandingPage />;
  if (route === 'login') return <LoginPage />;
  if (route === 'presentation') return <PresentationPage />;

  // Protected routes — require auth
  if (!user) return <LoginPage />;

  switch (route) {
    case 'dashboard': return <DashboardPage />;
    case 'start-charging': return <StartChargingPage />;
    case 'live-charging': return <LiveChargingPage />;
    case 'history': return <HistoryPage />;
    case 'analytics': return <AnalyticsPage />;
    case 'bill': return <BillPage />;
    case 'owner-dashboard': return <OwnerDashboardPage />;
    case 'owner-analytics': return <OwnerAnalyticsPage />;
    case 'manage-chargers': return <ManageChargersPage />;
    case 'settings': return <SettingsPage />;
    default: return <DashboardPage />;
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <RouterProvider>
          <AppContent />
          <Toaster theme="dark" position="top-right" richColors />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { route } = useRouter();
  const { user } = useAuth();
  const isPublic = route === 'landing' || route === 'login';
  const isPresentation = route === 'presentation';

  if (isPresentation) return <Router />;
  if (isPublic || !user) return <Router />;

  return (
    <AppLayout>
      <Router />
    </AppLayout>
  );
}

export default App;
