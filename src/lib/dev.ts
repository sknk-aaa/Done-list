/**
 * Dev-only flags.
 * SEED: when true (dev builds), the DB is seeded with the design-mock data and
 * "today" is pinned to DEV_TODAY so the UI matches handoff/screenshots for
 * visual diffing. MUST be false for release — production starts empty with the
 * real device date.
 */
export const SEED = __DEV__ && true;

/** Pinned "today" used only while SEED is true (matches the approved mocks). */
export const DEV_TODAY = '2026-06-19';

/** Dev-only: unlock Pro (dark theme etc.) without a real purchase. False for release. */
export const FORCE_PRO = __DEV__ && true;
