/**
 * Small, consistent haptic vocabulary (HIG: keep the set tiny, reserve strong
 * feedback for rarer moments). Native-only; web no-ops.
 *   success   — task completed (the app's signature positive moment)
 *   selection — light tick for navigation/toggles (tab, day, segment, switch)
 *   light     — opening the add sheet (FAB)
 *   medium    — destructive (delete)
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const on = Platform.OS !== 'web';

export const haptics = {
  success: () => {
    if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  selection: () => {
    if (on) Haptics.selectionAsync().catch(() => {});
  },
  light: () => {
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
};
