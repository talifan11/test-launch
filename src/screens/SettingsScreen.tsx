// Таб настроек: сводка текущего конфига и кнопка диалога выбора папки.

import { FolderCog, Server } from 'lucide-react';
import { GAME_SERVER_ADDRESS } from '../config';
import { useConnectionStore } from '../store/useConnectionStore';
import { useLauncherStore } from '../store/useLauncherStore';
import { Button } from '../components/ui/Button';

interface SettingsScreenProps {
  onOpenDialog: () => void;
}

export function SettingsScreen({ onOpenDialog }: SettingsScreenProps) {
  const config = useLauncherStore((s) => s.config);
  const status = useConnectionStore((s) => s.status);
  const refresh = useConnectionStore((s) => s.refresh);

  return (
    <div className="vr-scroll h-full overflow-y-auto p-6 max-w-3xl space-y-4">
      <section className="vr-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <FolderCog size={16} className="text-gold" />
            Каталог игры
          </h2>
          <Button onClick={onOpenDialog}>Изменить</Button>
        </div>
        <p className="vr-mono text-xs text-white/55 break-all">
          {config.game_path !== '' ? config.game_path : 'Не выбран'}
        </p>
      </section>

      <section className="vr-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Server size={16} className="text-blizzard" />
            Игровой сервер
          </h2>
          <Button onClick={() => void refresh()}>Проверить</Button>
        </div>
        <p className="vr-mono text-xs text-white/55">{GAME_SERVER_ADDRESS}</p>
        <p className="text-xs text-white/40 mt-2">
          Проверка трёхуровневая: процесс на этом ПК (online), доступность VPS извне через
          WireGuard (active), полный оффлайн (offline).
          Текущий результат:{' '}
          <span className="text-white/70">{status === 'unknown' ? 'нет данных' : status}</span>
        </p>
      </section>

      <p className="text-[11px] text-white/30 leading-relaxed">
        Клиент использует эмулятор OnlineFix с параметром EmulateTicket=false. Не меняйте его:
        сервер отклоняет подключения с билетом Steam.
      </p>
    </div>
  );
}
