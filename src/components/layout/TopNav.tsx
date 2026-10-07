// Верхняя навигация: табы и живой статус сервера.

import { RefreshCw } from 'lucide-react';
import { useConnectionStore } from '../../store/useConnectionStore';
import type { ServerStatusValue } from '../../types';

export type TabId = 'home' | 'news' | 'settings';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'home', label: 'Главная' },
  { id: 'news', label: 'Новости' },
  { id: 'settings', label: 'Настройки' },
];

interface TopNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const STATUS_LABEL: Record<ServerStatusValue | 'checking' | 'unknown', string> = {
  online: 'В сети',
  active: 'Доступен',
  offline: 'Оффлайн',
  checking: 'Проверка',
  unknown: 'Проверяем',
};

const DOT_CLASS: Record<ServerStatusValue | 'checking' | 'unknown', string> = {
  online: 'vr-dot-online',
  active: 'vr-dot-active',
  offline: 'vr-dot-offline',
  checking: 'vr-dot-checking',
  unknown: 'vr-dot-checking',
};

export function TopNav({ active, onChange }: TopNavProps) {
  const status = useConnectionStore((s) => s.status);
  const refresh = useConnectionStore((s) => s.refresh);

  return (
    <nav className="h-12 shrink-0 flex items-center justify-between px-5 bg-panel/70 border-b border-edge">
      <div className="flex h-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`vr-tab ${active === tab.id ? 'vr-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-xs text-white/60">
          <span className={`vr-dot ${DOT_CLASS[status]}`} />
          {STATUS_LABEL[status]}
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          className="vr-titlebar-btn"
          aria-label="Обновить статус"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </nav>
  );
}
