/**
 * Web preview data layer — in-memory, no expo-sqlite. Mirrors queries.ts's API
 * so the web build renders for visual diffing. Native uses queries.ts.
 */
import { DAILY_SEED, DEFAULT_TAGS, MONTH_CELLS, TAGOF, derivedDone } from '@/data/mockSeed';
import { toISO } from '@/lib/date';
import { SEED } from '@/lib/dev';

import type { Item, Settings, Tag } from './schema';
import type { ItemInput } from './types';

export type { ItemInput, ItemWithTag } from './types';

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;
export const memSubscribe = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export const memVersion = () => version;
const bump = () => {
  version += 1;
  listeners.forEach((l) => l());
};

export const mem = {
  items: [] as Item[],
  tags: [] as Tag[],
  settings: null as Settings | null,
};
let nextItemId = 1;
let nextTagId = 1;
const now = () => new Date();

export async function ensureSettings(): Promise<Settings> {
  if (mem.settings) return mem.settings;
  mem.settings = {
    id: 1,
    accentColor: '#48C1A8',
    locale: null,
    launchCount: 0,
    reviewRequested: false,
    showTime: true,
    swipeAction: 'date',
    createdAt: now(),
    updatedAt: now(),
  };
  return mem.settings;
}

export async function patchSettings(patch: Partial<Settings>): Promise<void> {
  await ensureSettings();
  mem.settings = { ...(mem.settings as Settings), ...patch, updatedAt: now() };
  bump();
}

export async function ensureDefaultTags(): Promise<void> {
  if (mem.tags.length) return;
  DEFAULT_TAGS.forEach((t, i) =>
    mem.tags.push({ id: nextTagId++, name: t.name, color: t.color, sortOrder: i, createdAt: now(), updatedAt: now() }),
  );
}

export async function listTags(): Promise<Tag[]> {
  return [...mem.tags].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const t: Tag = { id: nextTagId++, name, color, sortOrder: mem.tags.length, createdAt: now(), updatedAt: now() };
  mem.tags.push(t);
  bump();
  return t;
}

export async function updateTag(id: number, patch: Partial<Pick<Tag, 'name' | 'color'>>): Promise<void> {
  const t = mem.tags.find((x) => x.id === id);
  if (t) Object.assign(t, patch, { updatedAt: now() });
  bump();
}

export async function deleteTag(id: number): Promise<void> {
  mem.items.forEach((it) => {
    if (it.tagId === id) it.tagId = null;
  });
  mem.tags = mem.tags.filter((t) => t.id !== id);
  bump();
}

const nextSort = (date: string) =>
  mem.items.filter((i) => i.date === date).reduce((m, i) => Math.max(m, i.sortOrder), -1) + 1;

export async function createItem(input: ItemInput): Promise<Item> {
  const it: Item = {
    id: nextItemId++,
    title: input.title,
    memo: input.memo ?? null,
    date: input.date,
    time: input.time ?? null,
    notifyEnabled: input.notifyEnabled ?? false,
    isCompleted: false,
    sortOrder: nextSort(input.date),
    tagId: input.tagId ?? null,
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  mem.items.push(it);
  // Place the new task by time (timed → time order, untimed → bottom).
  const day = mem.items.filter((i) => i.date === input.date).sort((a, b) => a.sortOrder - b.sortOrder);
  const timed = day.filter((i) => i.time != null).sort((a, b) => (a.time! < b.time! ? -1 : a.time! > b.time! ? 1 : 0));
  const untimed = day.filter((i) => i.time == null);
  [...timed, ...untimed].forEach((i, idx) => {
    i.sortOrder = idx;
  });
  bump();
  return it;
}

export async function updateItem(id: number, input: ItemInput): Promise<void> {
  const it = mem.items.find((x) => x.id === id);
  if (!it) return;
  const sortOrder = it.date === input.date ? it.sortOrder : nextSort(input.date);
  Object.assign(it, {
    title: input.title,
    memo: input.memo ?? null,
    date: input.date,
    time: input.time ?? null,
    notifyEnabled: input.notifyEnabled ?? false,
    tagId: input.tagId ?? null,
    sortOrder,
    updatedAt: now(),
  });
  bump();
}

export async function deleteItem(id: number): Promise<void> {
  mem.items = mem.items.filter((i) => i.id !== id);
  bump();
}

export async function toggleComplete(id: number, value: boolean): Promise<void> {
  const it = mem.items.find((x) => x.id === id);
  if (it) {
    it.isCompleted = value;
    it.completedAt = value ? now() : null;
    it.updatedAt = now();
  }
  bump();
}

export async function reorderItems(orderedIds: number[]): Promise<void> {
  orderedIds.forEach((id, i) => {
    const it = mem.items.find((x) => x.id === id);
    if (it) {
      it.sortOrder = i;
      it.updatedAt = now();
    }
  });
  bump();
}

export async function eligibleNotifyItems(): Promise<Item[]> {
  return [];
}

export async function distinctLoggedDays(): Promise<number> {
  return new Set(mem.items.map((i) => i.date)).size;
}

export async function initApp(): Promise<Settings> {
  const s = await ensureSettings();
  await ensureDefaultTags();
  if (SEED && !mem.items.length) seedMock();
  mem.settings = { ...(mem.settings as Settings), launchCount: s.launchCount + 1 };
  return mem.settings;
}

function seedMock() {
  const byName: Record<string, number> = {};
  mem.tags.forEach((t) => (byName[t.name] = t.id));
  DAILY_SEED.forEach((t, i) =>
    mem.items.push({
      id: nextItemId++,
      title: t.title,
      memo: t.memo ?? null,
      date: '2026-06-19',
      time: t.time ?? null,
      notifyEnabled: false,
      isCompleted: t.done,
      sortOrder: i,
      tagId: byName[t.tag] ?? null,
      createdAt: now(),
      updatedAt: now(),
      completedAt: t.done ? now() : null,
    }),
  );
  for (const cell of MONTH_CELLS) {
    if (cell.out || cell.n === 19 || !cell.k) continue;
    cell.k.forEach((name, i) => {
      const done = derivedDone(cell.n, i);
      mem.items.push({
        id: nextItemId++,
        title: name,
        memo: null,
        date: toISO(2026, 5, cell.n),
        time: null,
        notifyEnabled: false,
        isCompleted: done,
        sortOrder: i,
        tagId: byName[TAGOF[name]] ?? null,
        createdAt: now(),
        updatedAt: now(),
        completedAt: done ? now() : null,
      });
    });
  }
  bump();
}
