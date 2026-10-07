// Очередь всплывающих уведомлений. Монтируется одним <Toaster /> в App.

import { create } from 'zustand';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

const AUTO_DISMISS_MS = 4200;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId;
    nextId += 1;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  info: (message: string): void => useToastStore.getState().push('info', message),
  success: (message: string): void => useToastStore.getState().push('success', message),
  error: (message: string): void => useToastStore.getState().push('error', message),
};
