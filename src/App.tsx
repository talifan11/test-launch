// Корневой компонент: маршрутизация экранов и инициализация данных.

import { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TitleBar } from './components/layout/TitleBar';
import { TopNav, type TabId } from './components/layout/TopNav';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { Toaster } from './components/ui/Toaster';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { NewsScreen } from './screens/NewsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useConnectionStore } from './store/useConnectionStore';
import { useLauncherStore } from './store/useLauncherStore';
import { useUpdateStore } from './store/useUpdateStore';

export default function App() {
  const session = useLauncherStore((s) => s.session);
  const loadConfig = useLauncherStore((s) => s.loadConfig);
  const checkSelfUpdate = useLauncherStore((s) => s.checkSelfUpdate);
  const initUpdates = useUpdateStore((s) => s.init);
  const startAutoRefresh = useConnectionStore((s) => s.startAutoRefresh);
  const stopAutoRefresh = useConnectionStore((s) => s.stopAutoRefresh);

  const [tab, setTab] = useState<TabId>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // старая загрузка один раз на сессию приложения
  useEffect(() => {
    void loadConfig();
    void initUpdates();
    void checkSelfUpdate();
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [loadConfig, initUpdates, checkSelfUpdate, startAutoRefresh, stopAutoRefresh]);

  if (session === null) {
    return (
      <div className="h-screen flex flex-col vr-bg">
        <TitleBar />
        <LoginScreen />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col vr-bg">
      <TitleBar />
      <TopNav active={tab} onChange={setTab} />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0">
          {tab === 'home' ? (
            <HomeScreen onOpenTab={setTab} onOpenSettings={() => setSettingsOpen(true)} />
          ) : tab === 'news' ? (
            <NewsScreen />
          ) : (
            <SettingsScreen onOpenDialog={() => setSettingsOpen(true)} />
          )}
        </main>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toaster />
    </div>
  );
}
