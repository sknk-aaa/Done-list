import { useSyncExternalStore } from 'react';

import { mem, memSubscribe, memVersion } from '@/db/queries.web';
import type { Tag } from '@/db/schema';
import type { ItemWithTag } from '@/db/types';

function useVersion() {
  return useSyncExternalStore(memSubscribe, memVersion, memVersion);
}

const withTag = (it: ItemWithTag): ItemWithTag => ({
  ...it,
  tag: mem.tags.find((t) => t.id === it.tagId) ?? null,
});

export function useDailyItems(date: string): ItemWithTag[] {
  useVersion();
  return mem.items
    .filter((i) => i.date === date)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => withTag(i as ItemWithTag));
}

export function useMonthItems(startISO: string, endISO: string): ItemWithTag[] {
  useVersion();
  return mem.items
    .filter((i) => i.date >= startISO && i.date <= endISO)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.sortOrder - b.sortOrder))
    .map((i) => withTag(i as ItemWithTag));
}

export function useTags(): Tag[] {
  useVersion();
  return [...mem.tags].sort((a, b) => a.sortOrder - b.sortOrder);
}
