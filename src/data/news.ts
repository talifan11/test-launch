// Новости и события проекта. Источник контента — редакция сервера.

import type { NewsItem } from '../types';

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    kind: 'patch',
    title: 'Обновление мира: Хезмидаль и новые дракар-лужи',
    summary:
      'Патч привносит переработанную генерацию болот, новых врагов и пересбалансированные дропы. Регенерация старых миров не требуется.',
    date: '2026-09-28',
    tag: 'Патч 0.9.4',
    accent: 'gold',
  },
  {
    id: 'n2',
    kind: 'event',
    title: 'Ночной рейд на чёрный форт',
    summary:
      'Каждую пятницу в 21:00 МСК на карте появляется усиленный босс. Урон по нему проходит только группой от четырёх человек.',
    date: '2026-09-25',
    tag: 'Событие',
    accent: 'blizzard',
  },
  {
    id: 'n3',
    kind: 'update',
    title: 'Клиент обновлён до версии 0.9.4',
    summary:
      'Лаунчер скачает исправленный клиент с OnlineFix автоматически. При проблемах запуска проверьте параметр EmulateTicket=false.',
    date: '2026-09-24',
    tag: 'Клиент',
    accent: 'emerald',
  },
  {
    id: 'n4',
    kind: 'maintenance',
    title: 'Технические работы на туннеле WireGuard',
    summary:
      'Возможны кратковременные недоступности сервера. Проверка статуса в лаунчере продолжит работать в трёхуровневом режиме.',
    date: '2026-09-20',
    tag: 'Работы',
    accent: 'blood',
  },
  {
    id: 'n5',
    kind: 'event',
    title: 'Турнир корабелов',
    summary:
      'Строим лучший дракар за неделю. Победители получают уникальные префиксы имён и место в зале славы на спавне.',
    date: '2026-09-15',
    tag: 'Конкурс',
    accent: 'blizzard',
  },
];

export function heroNews(): NewsItem {
  const first = NEWS_ITEMS[0];
  if (first === undefined) {
    throw new Error('Список новостей пуст');
  }
  return first;
}

export function feedNews(): NewsItem[] {
  return NEWS_ITEMS.slice(1);
}
