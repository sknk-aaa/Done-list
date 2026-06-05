/**
 * Notification logic (§9.5). Implemented in the notifications phase.
 * Strategy: reconcile = cancel everything, then (re)schedule every eligible item
 * (time set, notifyEnabled, not completed, future date-time). Deterministic id
 * derived from the item id.
 */

// TODO(notifications): implement with expo-notifications.
export async function ensureNotificationPermission(): Promise<boolean> {
  return false;
}

export async function reconcileNotifications(): Promise<void> {
  // no-op until the notifications phase
}
