import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
