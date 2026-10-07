// Статус игрового сервера живёт отдельно и обновляется по таймеру
// независимо от активного таба.

import { create } from 'zustand';
import { pingServer } from '../lib/api';
import { CONNECTION_REFRESH_MS, GAME_SERVER_ADDRESS } from '../config';
import type { ServerStatusValue } from '../types';

interface ConnectionState {
  status: ServerStatusValue | 'checking' | 'unknown';
  lastCheckedAt: number | null;
  refresh: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

let timer: number | null = null;

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: 'unknown',
  lastCheckedAt: null,
  refresh: async () => {
    set({ status: 'checking' });
    try {
      const value = await pingServer(GAME_SERVER_ADDRESS);
      set({ status: value, lastCheckedAt: Date.now() });
    } catch {
      set({ status: 'offline', lastCheckedAt: Date.now() });
    }
  },
  startAutoRefresh: () => {
    if (timer !== null) {
      return;
    }
    void get().refresh();
    timer = window.setInterval(() => {
      void get().refresh();
    }, CONNECTION_REFRESH_MS);
  },
  stopAutoRefresh: () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  },
}));
