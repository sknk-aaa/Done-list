import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabDaily, TabMonth } from '@/icons';
import { color, size } from '@/theme/tokens';

type TabView = 'daily' | 'month';

type Props = {
  view: TabView;
  onChange: (v: TabView) => void;
};

export function BottomTabBar({ view, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { height: size.tabBarH + insets.bottom, paddingBottom: insets.bottom }]}>
      <Tab active={view === 'daily'} onPress={() => onChange('daily')}>
        <TabDaily size={24} color={view === 'daily' ? color.teal : color.muted} />
      </Tab>
      <Tab active={view === 'month'} onPress={() => onChange('month')}>
        <TabMonth size={24} color={view === 'month' ? color.teal : color.muted} />
      </Tab>
    </View>
  );
}

function Tab({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <View style={[styles.topBorder, active && styles.topBorderActive]} />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.line,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'transparent' },
  topBorderActive: { backgroundColor: color.teal },
});
