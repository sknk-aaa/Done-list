import { asc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { itemsForDateQuery, itemsInRangeQuery } from '@/db/queries';
import { tags, type Tag } from '@/db/schema';
import type { ItemWithTag } from '@/db/types';

export function useDailyItems(date: string): ItemWithTag[] {
  const { data } = useLiveQuery(itemsForDateQuery(date), [date]);
  return (data ?? []) as ItemWithTag[];
}

export function useMonthItems(startISO: string, endISO: string): ItemWithTag[] {
  const { data } = useLiveQuery(itemsInRangeQuery(startISO, endISO), [startISO, endISO]);
  return (data ?? []) as ItemWithTag[];
}

export function useTags(): Tag[] {
  const { data } = useLiveQuery(db.query.tags.findMany({ orderBy: [asc(tags.sortOrder), asc(tags.id)] }));
  return (data ?? []) as Tag[];
}
