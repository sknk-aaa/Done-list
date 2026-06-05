import type { Filter } from '@/state/store';

/** A task is visible if status matches AND (no tag filter OR its tag is selected). */
export function matchesFilter(it: { isCompleted: boolean; tagId: number | null }, f: Filter): boolean {
  if (f.status === 'done' && !it.isCompleted) return false;
  if (f.status === 'todo' && it.isCompleted) return false;
  if (f.tagIds.length > 0 && (it.tagId == null || !f.tagIds.includes(it.tagId))) return false;
  return true;
}
