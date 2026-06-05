import { create } from 'zustand';

import { patchSettings } from '@/db/queries';
import type { Settings } from '@/db/schema';
import { addDaysISO, getTodayISO, parseISO } from '@/lib/date';

export type FilterStatus = 'all' | 'done' | 'todo';
export type Filter = { status: FilterStatus; tagIds: number[] };
export type SwipeAction = 'date' | 'tab';
export type SheetMode = 'add' | 'edit' | null;

type SheetState = { mode: SheetMode; editingId: number | null; presetDate: string | null };

type AppState = {
  // settings cache
  settingsLoaded: boolean;
  accentColor: string;
  locale: string | null;
  launchCount: number;
  reviewRequested: boolean;
  showTime: boolean;
  swipeAction: SwipeAction;

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

  // actions
  hydrateSettings: (s: Settings) => void;
  setShowTime: (v: boolean) => void;
  setSwipeAction: (v: SwipeAction) => void;
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
  openEditSheet: (id: number) => void;
  closeSheet: () => void;
  setFilterOpen: (v: boolean) => void;
  setDrawerOpen: (v: boolean) => void;
  openDatePop: (context: 'daily' | 'month') => void;
  closeDatePop: () => void;
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

  selectedDate: today,
  view: 'daily',
  viewYear: todayParts.y,
  viewMonth: todayParts.m0,

  filter: { status: 'all', tagIds: [] },

  sheet: { mode: null, editingId: null, presetDate: null },
  filterOpen: false,
  drawerOpen: false,
  datePopOpen: false,
  datePopContext: 'daily',

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
    set({ sheet: { mode: 'add', editingId: null, presetDate: presetDate ?? get().selectedDate } }),
  openEditSheet: (id) => set({ sheet: { mode: 'edit', editingId: id, presetDate: null } }),
  closeSheet: () => set({ sheet: { mode: null, editingId: null, presetDate: null } }),
  setFilterOpen: (v) => set({ filterOpen: v }),
  setDrawerOpen: (v) => set({ drawerOpen: v }),
  openDatePop: (context) => set({ datePopOpen: true, datePopContext: context }),
  closeDatePop: () => set({ datePopOpen: false }),
}));

/** True when a filter narrows results (used for funnel dot + month "+N" hiding). */
export const isFilterActive = (f: Filter) => f.status !== 'all' || f.tagIds.length > 0;
