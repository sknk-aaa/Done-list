import type { Item, Tag } from './schema';

export type ItemWithTag = Item & { tag: Tag | null };

export type ItemInput = {
  title: string;
  memo?: string | null;
  date: string;
  time?: string | null;
  notifyEnabled?: boolean;
  tagId?: number | null;
};
