// Конфиг, авторизация (заглушка), запуск игры и обновление лаунчера.

import { create } from 'zustand';
import {
  checkLauncherUpdate,
  getConfig,
  launchGame,
  saveConfig as apiSaveConfig,
} from '../lib/api';
import { GAME_SERVER_ADDRESS } from '../config';
import { toast } from './useToastStore';
import type { LauncherConfig, LauncherVersionInfo, Session } from '../types';

const SESSION_KEY = 'vr.session';

interface LauncherState {
  config: LauncherConfig;
  session: Session | null;
  launcherUpdate: LauncherVersionInfo | null;
  busy: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (patch: Partial<LauncherConfig>) => Promise<void>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  play: () => Promise<void>;
  checkSelfUpdate: () => Promise<void>;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'username' in parsed &&
      typeof (parsed as Session).username === 'string'
    ) {
      return { username: (parsed as Session).username, loggedInAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
}

export const useLauncherStore = create<LauncherState>((set, get) => ({
  config: { game_path: '', server_address: GAME_SERVER_ADDRESS, username: '' },
  session: readSession(),
  launcherUpdate: null,
  busy: false,

  loadConfig: async () => {
    try {
      const cfg = await getConfig();
      set({ config: cfg });
      // путь к игре держим в localStorage для машины состояний установки
      localStorage.setItem('vr.gamePath', cfg.game_path);
    } catch (err) {
      toast.error(`Не удалось прочитать конфиг: ${String(err)}`);
    }
  },

  updateConfig: async (patch) => {
    const next: LauncherConfig = { ...get().config, ...patch };
    set({ config: next });
    localStorage.setItem('vr.gamePath', next.game_path);
    try {
      await apiSaveConfig(next);
    } catch (err) {
      toast.error(`Сохранение конфига не удалось: ${String(err)}`);
    }
  },

  // Заглушка авторизации: непустые логин и пароль считаются успехом.
  login: (username, password) => {
    if (username.trim() === '' || password === '') {
      toast.error('Заполните имя и пароль');
      return false;
    }
    const session: Session = { username: username.trim(), loggedInAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    void get().updateConfig({ username: session.username });
    set({ session });
    toast.success(`Добро пожаловать, ${session.username}`);
    return true;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ session: null });
  },

  play: async () => {
    const state = get();
    if (state.busy) {
      return;
    }
    set({ busy: true });
    try {
      await launchGame(state.config.game_path);
      toast.info('Игра запущена, окно свёрнуто');
    } catch (err) {
      toast.error(String(err));
    } finally {
      set({ busy: false });
    }
  },

  checkSelfUpdate: async () => {
    try {
      const info = await checkLauncherUpdate();
      set({ launcherUpdate: info });
      if (info !== null) {
        toast.info(`Доступен лаунчер ${info.version}`);
      }
    } catch {
      // сервер версий может быть недоступен — это не критично
    }
  },
}));
