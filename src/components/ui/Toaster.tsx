// Очередь уведомлений. Монтируется ровно один раз в App.tsx.

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import type { ToastItem } from '../../store/useToastStore';

const ICONS = { info: Info, success: CheckCircle2, error: AlertTriangle };
const COLORS = {
  info: 'text-blizzard',
  success: 'text-emerald',
  error: 'text-blood',
};

function ToastRow({ item }: { item: ToastItem }) {
  const Icon = ICONS[item.kind];
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="vr-glass rounded-xl px-4 py-3 flex items-start gap-3 min-w-[320px] max-w-[420px]"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${COLORS[item.kind]}`} />
      <p className="text-sm text-white/85 leading-snug flex-1">{item.message}</p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="text-white/40 hover:text-white transition-colors"
        aria-label="Скрыть уведомление"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-20 right-6 z-[60] flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastRow key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
