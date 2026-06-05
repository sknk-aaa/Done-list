/**
 * In-app review trigger (§10, automatic native star dialog).
 * Conditions (all): distinct logged days ≥ 5, launchCount ≥ 5, fired on a
 * complete-toggle moment, reviewRequested == false. Native-only.
 */
import { Platform } from 'react-native';

import { distinctLoggedDays } from '@/db/queries';
import { useAppStore } from '@/state/store';

import type * as StoreReviewType from 'expo-store-review';

let StoreReview: typeof StoreReviewType | null = null;
if (Platform.OS !== 'web') {
  StoreReview = require('expo-store-review') as typeof StoreReviewType;
}

export async function maybeRequestReview(): Promise<void> {
  if (!StoreReview) return;
  const state = useAppStore.getState();
  if (state.reviewRequested) return;
  if (state.launchCount < 5) return;
  if ((await distinctLoggedDays()) < 5) return;
  if (!(await StoreReview.hasAction())) return;
  await StoreReview.requestReview();
  state.markReviewRequested();
}
