import { and, asc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';

import { DAILY_SEED, DEFAULT_TAGS, MONTH_CELLS, TAGOF, derivedDone } from '@/data/mockSeed';
import { SEED } from '@/lib/dev';
import { getTodayISO, toISO } from '@/lib/date';

import { db } from './client';
import { items, settings, tags, type Item, type NewItem, type Settings, type Tag } from './schema';
import type { ItemInput, ItemWithTag } from './types';

export type { ItemInput, ItemWithTag } from './types';

// ── settings ────────────────────────────────────────────────
export async function ensureSettings(): Promise<Settings> {
  const rows = await db.select().from(settings).limit(1);
  if (rows.length) return rows[0];
  const now = new Date();
  const [row] = await db.insert(settings).values({ createdAt: now, updatedAt: now }).returning();
  return row;
}

export async function patchSettings(patch: Partial<Settings>): Promise<void> {
  const current = await ensureSettings();
  await db.update(settings).set({ ...patch, updatedAt: new Date() }).where(eq(settings.id, current.id));
}

// ── tags ────────────────────────────────────────────────────
export function listTags() {
  return db.select().from(tags).orderBy(asc(tags.sortOrder), asc(tags.id));
}

export async function ensureDefaultTags(): Promise<void> {
  const existing = await db.select({ id: tags.id }).from(tags).limit(1);
  if (existing.length) return;
  const now = new Date();
  await db.insert(tags).values(
    DEFAULT_TAGS.map((t, i) => ({ name: t.name, color: t.color, sortOrder: i, createdAt: now, updatedAt: now })),
  );
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const now = new Date();
  const max = await db.select({ v: sql<number>`coalesce(max(${tags.sortOrder}), -1)` }).from(tags);
  const [row] = await db
    .insert(tags)
    .values({ name, color, sortOrder: (max[0]?.v ?? -1) + 1, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateTag(id: number, patch: Partial<Pick<Tag, 'name' | 'color'>>): Promise<void> {
  await db.update(tags).set({ ...patch, updatedAt: new Date() }).where(eq(tags.id, id));
}

export async function deleteTag(id: number): Promise<void> {
  // Keep tasks; just detach the tag (records are never cascade-deleted).
  await db.update(items).set({ tagId: null, updatedAt: new Date() }).where(eq(items.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
}

// ── items ───────────────────────────────────────────────────
async function nextSortOrder(date: string): Promise<number> {
  const max = await db
    .select({ v: sql<number>`coalesce(max(${items.sortOrder}), -1)` })
    .from(items)
    .where(eq(items.date, date));
  return (max[0]?.v ?? -1) + 1;
}

/** Order a day: timed tasks by time ascending, untimed appended at the bottom. */
async function sortDayByTime(date: string): Promise<void> {
  const rows = await db
    .select({ id: items.id, time: items.time })
    .from(items)
    .where(eq(items.date, date))
    .orderBy(asc(items.sortOrder));
  const timed = rows
    .filter((r) => r.time != null)
    .sort((a, b) => (a.time! < b.time! ? -1 : a.time! > b.time! ? 1 : 0));
  const untimed = rows.filter((r) => r.time == null);
  await reorderItems([...timed, ...untimed].map((r) => r.id));
}

export async function createItem(input: ItemInput): Promise<Item> {
  const now = new Date();
  const sortOrder = await nextSortOrder(input.date);
  const [row] = await db
    .insert(items)
    .values({
      title: input.title,
      memo: input.memo ?? null,
      date: input.date,
      time: input.time ?? null,
      notifyEnabled: input.notifyEnabled ?? false,
      isCompleted: false,
      sortOrder,
      tagId: input.tagId ?? null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    })
    .returning();
  // Place the new task by time (timed → time order, untimed → bottom).
  await sortDayByTime(input.date);
  return row;
}

export async function updateItem(id: number, input: ItemInput): Promise<void> {
  const now = new Date();
  const current = await db.select().from(items).where(eq(items.id, id)).limit(1);
  const cur = current[0];
  if (!cur) return;
  // If the date changed, move it to the end of the destination day.
  const sortOrder = cur.date === input.date ? cur.sortOrder : await nextSortOrder(input.date);
  await db
    .update(items)
    .set({
      title: input.title,
      memo: input.memo ?? null,
      date: input.date,
      time: input.time ?? null,
      notifyEnabled: input.notifyEnabled ?? false,
      tagId: input.tagId ?? null,
      sortOrder,
      updatedAt: now,
    })
    .where(eq(items.id, id));
}

export async function deleteItem(id: number): Promise<void> {
  await db.delete(items).where(eq(items.id, id));
}

/** Toggle complete. Touches ONLY isCompleted + completedAt (never sortOrder). */
export async function toggleComplete(id: number, value: boolean): Promise<void> {
  await db
    .update(items)
    .set({ isCompleted: value, completedAt: value ? new Date() : null, updatedAt: new Date() })
    .where(eq(items.id, id));
}

/** Persist a reordered list of item ids (within a single date scope). */
export async function reorderItems(orderedIds: number[]): Promise<void> {
  const now = new Date();
  await Promise.all(
    orderedIds.map((id, i) => db.update(items).set({ sortOrder: i, updatedAt: now }).where(eq(items.id, id))),
  );
}

// ── reactive query builders (used with useLiveQuery) ─────────
export function itemsForDateQuery(date: string) {
  return db.query.items.findMany({
    where: eq(items.date, date),
    orderBy: asc(items.sortOrder),
    with: { tag: true },
  });
}

export function itemsInRangeQuery(startISO: string, endISO: string) {
  return db.query.items.findMany({
    where: and(gte(items.date, startISO), lte(items.date, endISO)),
    orderBy: [asc(items.date), asc(items.sortOrder)],
    with: { tag: true },
  });
}

// ── notifications / review helpers ──────────────────────────
/** Items eligible for a scheduled reminder (future, with time, enabled, not done). */
export function eligibleNotifyItems(): Promise<Item[]> {
  return db
    .select()
    .from(items)
    .where(
      and(
        eq(items.notifyEnabled, true),
        eq(items.isCompleted, false),
        isNotNull(items.time),
        gte(items.date, getTodayISO()),
      ),
    );
}

/** Number of distinct days that have at least one logged item (review trigger). */
export async function distinctLoggedDays(): Promise<number> {
  const rows = await db.select({ d: items.date }).from(items).groupBy(items.date);
  return rows.length;
}

// ── app init / dev seed ─────────────────────────────────────
export async function initApp(): Promise<Settings> {
  const s = await ensureSettings();
  await ensureDefaultTags();
  if (SEED) await devSeed();
  // Count this launch (used by the in-app review trigger, §10).
  await db
    .update(settings)
    .set({ launchCount: s.launchCount + 1, updatedAt: new Date() })
    .where(eq(settings.id, s.id));
  return { ...s, launchCount: s.launchCount + 1 };
}

async function devSeed(): Promise<void> {
  const existing = await db.select({ id: items.id }).from(items).limit(1);
  if (existing.length) return;
  const tagList = await db.select().from(tags);
  const byName: Record<string, number> = {};
  tagList.forEach((t) => (byName[t.name] = t.id));
  const now = new Date();
  const rows: NewItem[] = [];

  DAILY_SEED.forEach((t, i) =>
    rows.push({
      title: t.title,
      memo: t.memo ?? null,
      date: '2026-06-19',
      time: t.time ?? null,
      notifyEnabled: false,
      isCompleted: t.done,
      sortOrder: i,
      tagId: byName[t.tag] ?? null,
      createdAt: now,
      updatedAt: now,
      completedAt: t.done ? now : null,
    }),
  );

  for (const cell of MONTH_CELLS) {
    if (cell.out || cell.n === 19 || !cell.k) continue;
    cell.k.forEach((name, i) => {
      const done = derivedDone(cell.n, i);
      rows.push({
        title: name,
        memo: null,
        date: toISO(2026, 5, cell.n),
        time: null,
        notifyEnabled: false,
        isCompleted: done,
        sortOrder: i,
        tagId: byName[TAGOF[name]] ?? null,
        createdAt: now,
        updatedAt: now,
        completedAt: done ? now : null,
      });
    });
  }

  await db.insert(items).values(rows);
}
