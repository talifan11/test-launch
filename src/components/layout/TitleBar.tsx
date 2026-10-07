// Кастомная строка заголовка: decoractions:false в tauri.conf.json,
// поэтому перетаскивание и кнопки окна реализуются здесь.

import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';
import { APP_NAME, LAUNCHER_VERSION } from '../../config';
import { ShieldLogo } from '../ui/ShieldLogo';

const appWindow = getCurrentWindow();

export function TitleBar() {
  return (
    <header
      data-tauri-drag-region
      className="h-12 shrink-0 flex items-center justify-between px-3 bg-panel/90 border-b border-edge"
    >
      <div className="flex items-center gap-3 pl-1" data-tauri-drag-region>
        <ShieldLogo size={22} />
        <span className="vr-display text-sm text-white/90" data-tauri-drag-region>
          {APP_NAME}
        </span>
        <span className="text-[11px] vr-mono text-white/35">v{LAUNCHER_VERSION}</span>
      </div>
      <nav className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => void appWindow.minimize()}
          className="vr-titlebar-btn"
          aria-label="Свернуть"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={() => void appWindow.toggleMaximize()}
          className="vr-titlebar-btn"
          aria-label="Развернуть"
        >
          <Square size={14} />
        </button>
        <button
          type="button"
          onClick={() => void appWindow.close()}
          className="vr-titlebar-btn vr-titlebar-btn-close"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      </nav>
    </header>
  );
}
