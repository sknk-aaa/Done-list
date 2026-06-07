import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AddEditSheet } from '@/components/AddEditSheet';
import { BottomTabBar } from '@/components/BottomTabBar';
import { DatePopover } from '@/components/DatePopover';
import { Drawer } from '@/components/Drawer';
import { FaqScreen } from '@/components/FaqScreen';
import { FilterSheet } from '@/components/FilterSheet';
import { Onboarding, ONBOARDED_KEY } from '@/components/Onboarding';
import { TagEditScreen } from '@/components/TagEditScreen';
import { Toast } from '@/components/Toast';
import { DailyScreen } from '@/screens/DailyScreen';
import { MonthScreen } from '@/screens/MonthScreen';
import { useAppStore } from '@/state/store';
import { useColors } from '@/theme/theme';

// Dev-only: expose the store to the web preview harness for driving overlays.
if (__DEV__ && typeof window !== 'undefined') {
  (window as unknown as { __appStore?: typeof useAppStore }).__appStore = useAppStore;
}

export default function AppShell() {
  const { width } = useWindowDimensions();
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setOnboardingOpen = useAppStore((s) => s.setOnboardingOpen);
  const c = useColors();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => {
      if (!v) setOnboardingOpen(true);
    });
  }, [setOnboardingOpen]);

  // Dev-only: live theme editing from tools/theme-editor (web, via postMessage).
  useEffect(() => {
    if (!__DEV__ || Platform.OS !== 'web' || typeof window === 'undefined') return;
    let mode: 'interact' | 'edit' = 'interact';
    let hl: HTMLElement | null = null;
    const clearHL = () => {
      if (hl) {
        hl.style.outline = '';
        hl.style.outlineOffset = '';
        hl = null;
      }
    };
    const nav = (a: string) => {
      const s = useAppStore.getState();
      s.closeSheet();
      s.setDrawerOpen(false);
      s.setFilterOpen(false);
      s.setTagEditOpen(false);
      s.setFaqOpen(false);
      s.setOnboardingOpen(false);
      if (a === 'daily') s.setView('daily');
      else if (a === 'month') s.setView('month');
      else if (a === 'drawer') s.setDrawerOpen(true);
      else if (a === 'add') s.openAddSheet();
      else if (a === 'filter') s.setFilterOpen(true);
      else if (a === 'tagEdit') s.setTagEditOpen(true);
      else if (a === 'faq') s.setFaqOpen(true);
    };
    const onMsg = (e: MessageEvent) => {
      const d = e.data as {
        __todoneTheme?: boolean; values?: Record<string, string> | null;
        __todoneMode?: boolean; mode?: 'interact' | 'edit';
        __todoneNav?: boolean; action?: string;
      };
      if (!d) return;
      if (d.__todoneTheme) useAppStore.getState().setThemeOverride(d.values ?? null);
      else if (d.__todoneMode) {
        mode = d.mode ?? 'interact';
        clearHL();
        document.body.style.cursor = mode === 'edit' ? 'crosshair' : '';
      } else if (d.__todoneNav && d.action) nav(d.action);
    };
    const transparent = (c: string) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
    const onClickCapture = (e: MouseEvent) => {
      if (mode !== 'edit') return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target as HTMLElement;
      const cs = getComputedStyle(el);
      let bg = '';
      let p: HTMLElement | null = el;
      while (p) {
        const b = getComputedStyle(p).backgroundColor;
        if (!transparent(b)) { bg = b; break; }
        p = p.parentElement;
      }
      const border = !transparent(cs.borderTopColor)
        ? cs.borderTopColor
        : !transparent(cs.borderColor) ? cs.borderColor : '';
      clearHL();
      hl = el;
      el.style.outline = '2px solid #ff3b30';
      el.style.outlineOffset = '1px';
      window.parent.postMessage(
        { __todonePick: true, bg, text: cs.color, border, tag: el.tagName.toLowerCase() },
        '*',
      );
    };
    window.addEventListener('message', onMsg);
    document.addEventListener('click', onClickCapture, true);
    return () => {
      window.removeEventListener('message', onMsg);
      document.removeEventListener('click', onClickCapture, true);
      clearHL();
    };
  }, []);

  const tx = useSharedValue(0);
  useEffect(() => {
    tx.value = withTiming(view === 'daily' ? 0 : -width, {
      duration: 340,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [view, width, tx]);

  const pagerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Animated.View style={[styles.pager, { width: width * 2 }, pagerStyle]}>
        <View style={{ width }}>
          <DailyScreen />
        </View>
        <View style={{ width }}>
          <MonthScreen />
        </View>
      </Animated.View>
      <BottomTabBar view={view} onChange={setView} />

      <AddEditSheet />
      <FilterSheet />
      <TagEditScreen />
      <FaqScreen />
      <Drawer />
      <DatePopover />
      <Onboarding />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  pager: { flex: 1, flexDirection: 'row' },
});
