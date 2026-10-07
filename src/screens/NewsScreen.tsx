// Новости: pill-фильтры по типу, лента карточек.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { feedNews, heroNews } from '../data/news';
import { NewsCard } from '../components/news/NewsCard';
import type { NewsItem } from '../types';

type FilterId = 'all' | 'patch' | 'event' | 'update' | 'maintenance';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'patch', label: 'Патчи' },
  { id: 'event', label: 'События' },
  { id: 'update', label: 'Обновления' },
  { id: 'maintenance', label: 'Работы' },
];

export function NewsScreen() {
  const [filter, setFilter] = useState<FilterId>('all');

  const items: NewsItem[] = [heroNews(), ...feedNews()].filter(
    (item) => filter === 'all' || item.kind === filter,
  );

  return (
    <div className="vr-scroll h-full overflow-y-auto p-6 space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`vr-pill ${filter === f.id ? 'vr-pill-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </motion.div>
      {items.length === 0 ? (
        <p className="text-sm text-white/40 py-10 text-center">Нет новостей этого типа</p>
      ) : null}
    </div>
  );
}
