import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ── tags ──────────────────────────────
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(), // プリセット色のhex
  sortOrder: integer('sort_order').notNull().default(0), // タグ一覧/絞り込みシートの並び
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── items（タスク＝やること/やったこと）──
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  memo: text('memo'), // 任意
  date: text('date').notNull(), // 'YYYY-MM-DD' ローカル日付
  time: text('time'), // 'HH:MM' ローカル時刻・任意（null=時刻なし）
  notifyEnabled: integer('notify_enabled', { mode: 'boolean' }).notNull().default(false),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0), // 日付スコープ内の並び
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'set null' }), // タグ削除→null
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }), // 完了時刻・未完了ならnull
});

// ── settings（アプリ設定・単一行運用）──
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accentColor: text('accent_color').notNull().default('#48C1A8'), // ティール初期値
  locale: text('locale'), // null=端末ロケール自動、手動上書き時のみ値
  launchCount: integer('launch_count').notNull().default(0), // アプリ起動回数（レビュー判定用）
  reviewRequested: integer('review_requested', { mode: 'boolean' }).notNull().default(false),
  showTime: integer('show_time', { mode: 'boolean' }).notNull().default(true),
  swipeAction: text('swipe_action').notNull().default('tab'), // 'date' | 'tab'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const itemsRelations = relations(items, ({ one }) => ({
  tag: one(tags, { fields: [items.tagId], references: [tags.id] }),
}));
export const tagsRelations = relations(tags, ({ many }) => ({
  items: many(items),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Settings = typeof settings.$inferSelect;
