/**
 * In-app review trigger (§10, automatic native star dialog).
 * Conditions (all): distinct logged days ≥ 5, launchCount ≥ 5, fired on a
 * complete-toggle moment, reviewRequested == false. Implemented in the review phase.
 */

// TODO(review): implement with expo-store-review.
export async function maybeRequestReview(): Promise<void> {
  // no-op until the review phase
}
