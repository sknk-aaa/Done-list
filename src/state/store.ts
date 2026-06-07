import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { patchSettings } from '@/db/queries';
import type { Settings } from '@/db/schema';
import type { ItemWithTag } from '@/db/types';
import { addDaysISO, getTodayISO, parseISO } from '@/lib/date';
import { FORCE_PRO } from '@/lib/dev';

export type FilterStatus = 'all' | 'done' | 'todo';
export type Filter = { status: FilterStatus; tagIds: number[] };
export type SwipeAction = 'date' | 'tab';
export type SheetMode = 'add' | 'edit' | null;
export type Toast = { msg: string; action?: { label: string; run: () => void } };

type SheetState = { mode: SheetMode; editingItem: ItemWithTag | null; presetDate: string | null };

type AppState = {
  // settings cache
  settingsLoaded: boolean;
  accentColor: string;
  locale: string | null;
  launchCount: number;
  reviewRequested: boolean;
  showTime: boolean;
  swipeAction: SwipeAction;
  darkMode: boolean; // Pro dark theme preference (persisted in AsyncStorage)
  isPro: boolean; // entitlement (RevenueCat; dev-forced in dev)

  // navigation
  selectedDate: string; // ISO 'YYYY-MM-DD'
  view: 'daily' | 'month';
  viewYear: number;
  viewMonth: number; // 0-indexed

  // filter (shared by daily + month)
  filter: Filter;

  // overlays
  sheet: SheetState;
  filterOpen: boolean;
  drawerOpen: boolean;
  datePopOpen: boolean;
  datePopContext: 'daily' | 'month';
  tagEditOpen: boolean;
  faqOpen: boolean;
  onboardingOpen: boolean;
  themeOverride: Record<string, string> | null;
  toast: Toast | null;

  // actions
  hydrateSettings: (s: Settings) => void;
  setShowTime: (v: boolean) => void;
  setSwipeAction: (v: SwipeAction) => void;
  setDarkMode: (v: boolean) => void;
  setPro: (v: boolean) => void;
  setAccentColor: (v: string) => void;
  setLocale: (v: string | null) => void;
  markReviewRequested: () => void;

  setView: (v: 'daily' | 'month') => void;
  setSelectedDate: (iso: string) => void;
  shiftDay: (delta: number) => void;
  goToday: () => void;
  setViewMonth: (year: number, month0: number) => void;
  shiftMonth: (delta: number) => void;

  setFilterStatus: (s: FilterStatus) => void;
  setFilterTags: (ids: number[]) => void;
  resetFilter: () => void;

  openAddSheet: (presetDate?: string) => void;
  openEditSheet: (item: ItemWithTag) => void;
  closeSheet: () => void;
  setFilterOpen: (v: boolean) => void;
  setDrawerOpen: (v: boolean) => void;
  openDatePop: (context: 'daily' | 'month') => void;
  closeDatePop: () => void;
  setTagEditOpen: (v: boolean) => void;
  setFaqOpen: (v: boolean) => void;
  setOnboardingOpen: (v: boolean) => void;
  setThemeOverride: (v: Record<string, string> | null) => void;
  showToast: (msg: string, action?: Toast['action']) => void;
  clearToast: () => void;
};

const today = getTodayISO();
const todayParts = parseISO(today);

export const useAppStore = create<AppState>((set, get) => ({
  settingsLoaded: false,
  accentColor: '#48C1A8',
  locale: null,
  launchCount: 0,
  reviewRequested: false,
  showTime: true,
  swipeAction: 'date',
  darkMode: false,
  isPro: FORCE_PRO,

  selectedDate: today,
  view: 'daily',
  viewYear: todayParts.y,
  viewMonth: todayParts.m0,

  filter: { status: 'all', tagIds: [] },

  sheet: { mode: null, editingItem: null, presetDate: null },
  filterOpen: false,
  drawerOpen: false,
  datePopOpen: false,
  datePopContext: 'daily',
  tagEditOpen: false,
  faqOpen: false,
  onboardingOpen: false,
  themeOverride: null,
  toast: null,

  hydrateSettings: (s) =>
    set({
      settingsLoaded: true,
      accentColor: s.accentColor,
      locale: s.locale,
      launchCount: s.launchCount,
      reviewRequested: s.reviewRequested,
      showTime: s.showTime,
      swipeAction: (s.swipeAction as SwipeAction) ?? 'date',
    }),

  setShowTime: (v) => {
    set({ showTime: v });
    void patchSettings({ showTime: v });
  },
  setDarkMode: (v) => {
    set({ darkMode: v });
    void AsyncStorage.setItem('todone_dark', v ? '1' : '0');
  },
  setPro: (v) => set({ isPro: v }),
  setSwipeAction: (v) => {
    set({ swipeAction: v });
    void patchSettings({ swipeAction: v });
  },
  setAccentColor: (v) => {
    set({ accentColor: v });
    void patchSettings({ accentColor: v });
  },
  setLocale: (v) => {
    set({ locale: v });
    void patchSettings({ locale: v });
  },
  markReviewRequested: () => {
    set({ reviewRequested: true });
    void patchSettings({ reviewRequested: true });
  },

  setView: (v) => set({ view: v }),
  setSelectedDate: (iso) => {
    const { m0, y } = parseISO(iso);
    set({ selectedDate: iso, viewYear: y, viewMonth: m0 });
  },
  shiftDay: (delta) => {
    const next = addDaysISO(get().selectedDate, delta);
    const { y, m0 } = parseISO(next);
    set({ selectedDate: next, viewYear: y, viewMonth: m0 });
  },
  goToday: () => {
    const t = getTodayISO();
    const { y, m0 } = parseISO(t);
    set({ selectedDate: t, viewYear: y, viewMonth: m0 });
  },
  setViewMonth: (year, month0) => set({ viewYear: year, viewMonth: month0 }),
  shiftMonth: (delta) => {
    const { viewYear, viewMonth } = get();
    const total = viewYear * 12 + viewMonth + delta;
    set({ viewYear: Math.floor(total / 12), viewMonth: ((total % 12) + 12) % 12 });
  },

  setFilterStatus: (s) => set((st) => ({ filter: { ...st.filter, status: s } })),
  setFilterTags: (ids) => set((st) => ({ filter: { ...st.filter, tagIds: ids } })),
  resetFilter: () => set({ filter: { status: 'all', tagIds: [] } }),

  openAddSheet: (presetDate) =>
    set({ sheet: { mode: 'add', editingItem: null, presetDate: presetDate ?? get().selectedDate } }),
  openEditSheet: (item) => set({ sheet: { mode: 'edit', editingItem: item, presetDate: null } }),
  closeSheet: () => set({ sheet: { mode: null, editingItem: null, presetDate: null } }),
  setFilterOpen: (v) => set({ filterOpen: v }),
  setDrawerOpen: (v) => set({ drawerOpen: v }),
  openDatePop: (context) => set({ datePopOpen: true, datePopContext: context }),
  closeDatePop: () => set({ datePopOpen: false }),
  setTagEditOpen: (v) => set({ tagEditOpen: v }),
  setFaqOpen: (v) => set({ faqOpen: v }),
  setThemeOverride: (v) => set({ themeOverride: v }),
  setOnboardingOpen: (v) => set({ onboardingOpen: v }),
  showToast: (msg, action) => set({ toast: { msg, action } }),
  clearToast: () => set({ toast: null }),
}));

/** True when a filter narrows results (used for funnel dot + month "+N" hiding). */
export const isFilterActive = (f: Filter) => f.status !== 'all' || f.tagIds.length > 0;
