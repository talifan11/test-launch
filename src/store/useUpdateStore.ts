// Машина состояний установки и обновления игры.
// Цикл: манифест -> скачивание ZIP в downloads -> SHA-256 -> unpack_zip
// -> запись installed.json.

import { create } from 'zustand';
import {
  cancelDownload,
  downloadBatch,
  fetchManifest,
  getInstalledVersion,
  onDownloadProgress,
  onUnpackProgress,
  setInstalledVersion,
  unpackZip,
} from '../lib/api';
import { toast } from './useToastStore';
import type { Manifest, ProgressEvent, UpdatePhase } from '../types';

interface UpdateState {
  phase: UpdatePhase;
  manifest: Manifest | null;
  installedVersion: string | null;
  progress: ProgressEvent | null;
  error: string | null;
  init: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  startInstall: () => Promise<void>;
  cancel: () => Promise<void>;
}

function messageOf(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Неизвестная ошибка';
}

export const useUpdateStore = create<UpdateState>((set, get) => {
  let unlistenDownload: (() => void) | null = null;
  let unlistenUnpack: (() => void) | null = null;

  const ensureListeners = async (): Promise<void> => {
    if (unlistenDownload === null) {
      unlistenDownload = await onDownloadProgress((e) => set({ progress: e }));
    }
    if (unlistenUnpack === null) {
      unlistenUnpack = await onUnpackProgress((e) => set({ progress: e }));
    }
  };

  return {
    phase: 'idle',
    manifest: null,
    installedVersion: null,
    progress: null,
    error: null,

    init: async () => {
      try {
        await ensureListeners();
        const installed = await getInstalledVersion();
        set({ installedVersion: installed });
        await get().checkForUpdates();
      } catch (err) {
        set({ phase: 'error', error: messageOf(err) });
      }
    },

    checkForUpdates: async () => {
      set({ phase: 'checking', error: null });
      try {
        const manifest = await fetchManifest();
        set({ manifest });
        const installed = get().installedVersion;
        if (installed === null) {
          set({ phase: 'needs-install' });
        } else if (installed !== manifest.version) {
          set({ phase: 'needs-update' });
        } else {
          set({ phase: 'ready' });
        }
      } catch (err) {
        // без манифеста считаем состояние неизвестным, но не блокируем запуск
        set({ phase: get().installedVersion !== null ? 'ready' : 'error', error: messageOf(err) });
      }
    },

    startInstall: async () => {
      const manifest = get().manifest;
      if (manifest === null || manifest.files.length === 0) {
        set({ phase: 'error', error: 'Манифест пуст или недоступен' });
        return;
      }
      set({ phase: 'downloading', progress: null, error: null });
      try {
        const savedPaths = await downloadBatch(manifest.files);
        const zipPath = savedPaths[0];
        if (zipPath === undefined) {
          throw new Error('Ни один файл не был сохранён');
        }
        const gamePath = localStorage.getItem('vr.gamePath') ?? '';
        if (gamePath === '') {
          throw new Error('Путь к игре не выбран. Откройте настройки.');
        }
        set({ phase: 'unpacking' });
        await unpackZip(zipPath, gamePath);
        await setInstalledVersion(manifest.version);
        set({ phase: 'ready', installedVersion: manifest.version, progress: null });
        toast.success(`Установлена версия ${manifest.version}`);
      } catch (err) {
        const msg = messageOf(err);
        set({ phase: 'error', error: msg });
        toast.error(msg);
      }
    },

    cancel: async () => {
      try {
        await cancelDownload();
      } catch {
        // отмена возможна только во время активной загрузки
      }
      set({ phase: get().installedVersion !== null ? 'ready' : 'needs-install', progress: null });
      toast.info('Загрузка остановлена');
    },
  };
});
