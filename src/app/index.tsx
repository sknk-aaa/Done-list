import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { BottomTabBar } from '@/components/BottomTabBar';
import { DailyScreen } from '@/screens/DailyScreen';
import { MonthScreen } from '@/screens/MonthScreen';
import { useAppStore } from '@/state/store';
import { color } from '@/theme/tokens';

export default function AppShell() {
  const { width } = useWindowDimensions();
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const tx = useSharedValue(0);
  useEffect(() => {
    tx.value = withTiming(view === 'daily' ? 0 : -width, {
      duration: 340,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [view, width, tx]);

  const pagerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.pager, { width: width * 2 }, pagerStyle]}>
        <View style={{ width }}>
          <DailyScreen />
        </View>
        <View style={{ width }}>
          <MonthScreen />
        </View>
      </Animated.View>
      <BottomTabBar view={view} onChange={setView} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg, overflow: 'hidden' },
  pager: { flex: 1, flexDirection: 'row' },
});
