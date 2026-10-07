// Крупная карточка главной новости на HomeScreen.

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { NewsItem } from '../../types';

interface HeroNewsCardProps {
  item: NewsItem;
  onOpenFeed: () => void;
}

export function HeroNewsCard({ item, onOpenFeed }: HeroNewsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="vr-card relative overflow-hidden p-7 min-h-[220px] flex flex-col justify-end"
    >
      {/* декоративное зарево вместо изображения */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(520px 220px at 85% 0%, rgba(255,194,75,0.14), transparent 70%), radial-gradient(420px 200px at 10% 100%, rgba(14,156,255,0.12), transparent 70%)',
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <span className="vr-pill vr-pill-active">{item.tag}</span>
          <time className="text-xs text-white/40 vr-mono">{item.date}</time>
        </div>
        <h2 className="vr-display text-2xl text-white leading-snug mb-2">{item.title}</h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-xl mb-4">{item.summary}</p>
        <button
          type="button"
          onClick={onOpenFeed}
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-white transition-colors"
        >
          Все новости
          <ArrowRight size={15} />
        </button>
      </div>
    </motion.article>
  );
}
