/**
 * Notification logic (§9.5). Reconcile = cancel all, then (re)schedule every
 * eligible item. Deterministic identifier from the item id. Native-only.
 */
import { Platform } from 'react-native';

import { eligibleNotifyItems } from '@/db/queries';
import i18n from '@/i18n';

import type * as Notif from 'expo-notifications';

let Notifications: typeof Notif | null = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications') as typeof Notif;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const notifId = (id: number) => `task-${id}`;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function reconcileNotifications(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const items = await eligibleNotifyItems();
  const now = Date.now();
  for (const it of items) {
    if (!it.time) continue;
    const [y, m, d] = it.date.split('-').map(Number);
    const [hh, mm] = it.time.split(':').map(Number);
    const when = new Date(y, m - 1, d, hh, mm, 0, 0);
    if (when.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: notifId(it.id),
      content: { title: i18n.t('notif.body', { title: it.title }) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}
