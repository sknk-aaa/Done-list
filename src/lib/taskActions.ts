import { createItem, deleteItem, reorderItems, toggleComplete, updateItem, type ItemInput } from '@/db/queries';
import type { Item } from '@/db/schema';

import { reconcileNotifications } from './notifications';
import { maybeRequestReview } from './review';

export async function setComplete(item: Pick<Item, 'id' | 'isCompleted'>, value: boolean): Promise<void> {
  await toggleComplete(item.id, value);
  // Side effects must not block the checkmark UI update — run after, non-blocking.
  void reconcileNotifications();
  if (value) void maybeRequestReview();
}

export async function saveNewTask(input: ItemInput): Promise<Item> {
  const row = await createItem(input);
  await reconcileNotifications();
  return row;
}

export async function saveEditTask(id: number, input: ItemInput): Promise<void> {
  await updateItem(id, input);
  await reconcileNotifications();
}

export async function removeTask(id: number): Promise<void> {
  await deleteItem(id);
  await reconcileNotifications();
}

/** Persist drag-reordered ids (within one date). No notify/review impact. */
export async function reorderTasks(orderedIds: number[]): Promise<void> {
  await reorderItems(orderedIds);
}
