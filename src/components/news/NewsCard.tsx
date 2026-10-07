// Компактная карточка новости для ленты и боковой колонки.

import { motion } from 'framer-motion';
import type { NewsItem } from '../../types';

const ACCENT_TEXT: Record<string, string> = {
  gold: 'text-gold',
  blizzard: 'text-blizzard',
  emerald: 'text-emerald',
  blood: 'text-blood',
};

interface NewsCardProps {
  item: NewsItem;
  compact?: boolean;
}

export function NewsCard({ item, compact = false }: NewsCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`vr-card ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${ACCENT_TEXT[item.accent ?? 'gold']}`}>
          {item.tag}
        </span>
        <time className="ml-auto text-[11px] text-white/35 vr-mono">{item.date}</time>
      </div>
      <h3 className={`${compact ? 'text-sm' : 'text-base'} text-white font-semibold leading-snug mb-1.5`}>
        {item.title}
      </h3>
      {compact ? null : (
        <p className="text-[13px] text-white/55 leading-relaxed line-clamp-3">{item.summary}</p>
      )}
    </motion.article>
  );
}
