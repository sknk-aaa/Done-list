import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabDaily, TabMonth } from '@/icons';
import { size } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

type TabView = 'daily' | 'month';

type Props = {
  view: TabView;
  onChange: (v: TabView) => void;
};

export function BottomTabBar({ view, onChange }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { height: size.tabBarH + insets.bottom, paddingBottom: insets.bottom }]}>
      <Tab active={view === 'daily'} onPress={() => onChange('daily')}>
        <TabDaily size={24} color={view === 'daily' ? c.teal : c.muted} />
      </Tab>
      <Tab active={view === 'month'} onPress={() => onChange('month')}>
        <TabMonth size={24} color={view === 'month' ? c.teal : c.muted} />
      </Tab>
    </View>
  );
}

function Tab({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <View style={[styles.topBorder, active && styles.topBorderActive]} />
      {children}
    </Pressable>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: c.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'transparent' },
  topBorderActive: { backgroundColor: c.teal },
});
