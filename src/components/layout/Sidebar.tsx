// Левая колонка: профиль игрока, адрес сервера, ссылки сообщества.

import { MessagesSquare, Send, Users } from 'lucide-react';
import { COMMUNITY_LINKS, GAME_SERVER_ADDRESS } from '../../config';
import { openExternal } from '../../lib/api';
import { useConnectionStore } from '../../store/useConnectionStore';
import { useLauncherStore } from '../../store/useLauncherStore';
import { ShieldLogo } from '../ui/ShieldLogo';

const LINKS = [
  { label: 'Discord', href: COMMUNITY_LINKS.discord, Icon: MessagesSquare },
  { label: 'ВКонтакте', href: COMMUNITY_LINKS.vk, Icon: Users },
  { label: 'Telegram', href: COMMUNITY_LINKS.telegram, Icon: Send },
];

export function Sidebar() {
  const session = useLauncherStore((s) => s.session);
  const logout = useLauncherStore((s) => s.logout);
  const status = useConnectionStore((s) => s.status);

  return (
    <aside className="w-60 shrink-0 h-full flex flex-col gap-6 p-5 bg-panel/60 border-r border-edge">
      <div className="flex items-center gap-3">
        <ShieldLogo size={36} />
        <div className="min-w-0">
          <p className="vr-display text-sm text-white truncate">
            {session !== null ? session.username : 'Гость'}
          </p>
          <p className="text-xs text-white/40">
            {status === 'online'
              ? 'Сервер активен'
              : status === 'active'
                ? 'Сервер доступен извне'
                : 'Не в сети'}
          </p>
        </div>
      </div>

      <div className="vr-card p-3">
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">
          Адрес сервера
        </p>
        <p className="vr-mono text-xs text-blizzard">{GAME_SERVER_ADDRESS}</p>
      </div>

      <div className="space-y-1 mt-auto">
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2 px-1">
          Сообщество
        </p>
        {LINKS.map(({ label, href, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => void openExternal(href)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        {session !== null ? (
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-blood/80 hover:text-blood hover:bg-blood/10 transition-all"
          >
            <Send size={16} className="rotate-180" />
            Выйти
          </button>
        ) : null}
      </div>
    </aside>
  );
}
