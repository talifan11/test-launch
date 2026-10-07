// Главная: большой баннер с кнопкой ИГРАТЬ, статус сервера, hero-новость.

import { motion } from 'framer-motion';
import { AlertTriangle, Download, RefreshCw, Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { GAME_SERVER_ADDRESS } from '../config';
import { heroNews } from '../data/news';
import { useConnectionStore } from '../store/useConnectionStore';
import { useLauncherStore } from '../store/useLauncherStore';
import { useUpdateStore } from '../store/useUpdateStore';
import { HeroNewsCard } from '../components/news/HeroNewsCard';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { TabId } from '../components/layout/TopNav';

function formatSpeed(bps: number): string {
  if (bps <= 0) {
    return '';
  }
  const mb = bps / (1024 * 1024);
  return `${mb.toFixed(1)} МБ/с`;
}

interface HomeScreenProps {
  onOpenTab: (tab: TabId) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ onOpenTab, onOpenSettings }: HomeScreenProps) {
  const config = useLauncherStore((s) => s.config);
  const play = useLauncherStore((s) => s.play);
  const busy = useLauncherStore((s) => s.busy);
  const status = useConnectionStore((s) => s.status);
  const refreshStatus = useConnectionStore((s) => s.refresh);

  const phase = useUpdateStore((s) => s.phase);
  const progress = useUpdateStore((s) => s.progress);
  const error = useUpdateStore((s) => s.error);
  const installedVersion = useUpdateStore((s) => s.installedVersion);
  const manifest = useUpdateStore((s) => s.manifest);
  const startInstall = useUpdateStore((s) => s.startInstall);
  const cancel = useUpdateStore((s) => s.cancel);
  const checkForUpdates = useUpdateStore((s) => s.checkForUpdates);

  // данные манифеста подтягиваем при заходе на главную, если ещё пусто
  useEffect(() => {
    if (manifest === null) {
      void checkForUpdates();
    }
  }, [manifest, checkForUpdates]);

  const installing = phase === 'downloading' || phase === 'unpacking';
  const needsAction = phase === 'needs-install' || phase === 'needs-update';
  const gameReady = config.game_path.trim() !== '';

  let mainLabel = 'Играть';
  let onMainClick: () => void = () => void play();
  let variant: 'primary' | 'ghost' = 'primary';

  if (!gameReady) {
    mainLabel = 'Указать папку игры';
    onMainClick = onOpenSettings;
    variant = 'ghost';
  } else if (installing) {
    mainLabel = phase === 'downloading' ? 'Загрузка...' : 'Распаковка...';
    onMainClick = () => undefined;
    variant = 'ghost';
  } else if (needsAction) {
    mainLabel = phase === 'needs-install' ? 'Установить' : 'Обновить';
    onMainClick = () => void startInstall();
    variant = 'primary';
  }

  const percent =
    progress !== null && progress.total > 0
      ? progress.received / progress.total
      : progress !== null && progress.total_files > 0
        ? progress.done_files / progress.total_files
        : 0;

  return (
    <div className="vr-scroll h-full overflow-y-auto p-6 space-y-6">
      {/* Баннер */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-2xl overflow-hidden border border-edge"
        style={{
          background:
            'radial-gradient(900px 320px at 80% -20%, rgba(255,194,75,0.16), transparent 65%), radial-gradient(700px 340px at 5% 120%, rgba(14,156,255,0.16), transparent 65%), linear-gradient(150deg, #131b28 0%, #0d1219 60%, #0a0e14 100%)',
        }}
      >
        <div className="p-8 md:p-10 flex flex-col gap-6 min-h-[280px] justify-end relative">
          <div className="flex items-center gap-3 text-xs vr-mono text-white/45">
            <span>{GAME_SERVER_ADDRESS}</span>
            <button
              type="button"
              onClick={() => void refreshStatus()}
              className="hover:text-white transition-colors"
              aria-label="Обновить статус сервера"
            >
              <RefreshCw size={13} />
            </button>
            <span className="text-white/25">|</span>
            <span>
              {status === 'online'
                ? 'Сервер в сети'
                : status === 'active'
                  ? 'Сервер доступен извне'
                  : status === 'checking' || status === 'unknown'
                    ? 'Проверяем связь'
                    : 'Сервер недоступен'}
            </span>
          </div>

          <h1 className="vr-display text-4xl md:text-5xl text-white leading-tight">
            Valheim Rouge
          </h1>
          <p className="text-white/55 max-w-lg text-sm leading-relaxed">
            Приватный сервер выживания. Версия игры:{' '}
            <span className="vr-mono text-gold">{installedVersion ?? 'не установлена'}</span>
            {manifest !== null ? ` (доступно ${manifest.version})` : ''}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Button variant={variant} size="lg" loading={busy} onClick={onMainClick}>
              {mainLabel}
            </Button>
            {installing ? (
              <Button variant="danger" onClick={() => void cancel()}>
                Отменить
              </Button>
            ) : null}
            {phase === 'ready' && gameReady ? (
              <Button variant="ghost" onClick={onOpenSettings}>
                <Settings2 size={16} />
                Настройки
              </Button>
            ) : null}
          </div>

          {installing && progress !== null ? (
            <div className="max-w-xl space-y-1">
              <ProgressBar
                value={percent}
                blue={phase === 'unpacking'}
                label={`${progress.file} ${formatSpeed(progress.speed_bps)}`}
              />
            </div>
          ) : null}

          {phase === 'error' && error !== null ? (
            <div className="flex items-start gap-2 text-sm text-blood bg-blood/10 border border-blood/25 rounded-xl px-4 py-3 max-w-xl">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                {error}{' '}
                <button
                  type="button"
                  className="underline hover:text-white"
                  onClick={() => void startInstall()}
                >
                  Повторить
                </button>
              </span>
            </div>
          ) : null}

          {needsAction && manifest !== null ? (
            <div className="flex items-center gap-2 text-xs text-blizzard">
              <Download size={14} />
              Доступно {phase === 'needs-install' ? 'установка' : 'обновление'} до {manifest.version}
            </div>
          ) : null}
        </div>
      </motion.section>

      <HeroNewsCard item={heroNews()} onOpenFeed={() => onOpenTab('news')} />
    </div>
  );
}
