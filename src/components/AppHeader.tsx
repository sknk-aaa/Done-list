import { type ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';

import { Funnel, Hamburger } from '@/icons';
import { space } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

type Props = {
  left: ReactNode;
  sub?: ReactNode;
  filterActive: boolean;
  onFilter: () => void;
  onMenu: () => void;
};

export function HeaderCaret() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Svg width={10} height={7} viewBox="0 0 10 7" style={styles.caret}>
      <Polygon points="0,0 10,0 5,7" fill={c.muted} />
    </Svg>
  );
}

export function AppHeader({ left, sub, filterActive, onFilter, onMenu }: Props) {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <View style={styles.left}>{left}</View>
        <View style={styles.tools}>
          <Pressable
            onPress={onFilter}
            hitSlop={10}
            style={styles.funnelWrap}
            accessibilityRole="button"
            accessibilityLabel="絞り込み"
            accessibilityState={{ selected: filterActive }}
          >
            <Funnel size={26} color={c.teal} />
            {filterActive && <View style={styles.filterDot} />}
          </Pressable>
          <Pressable onPress={onMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel="メニュー">
            <Hamburger size={28} color={c.ink2} />
          </Pressable>
        </View>
      </View>
      {sub != null && <View style={styles.sub}>{sub}</View>}
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  wrap: { paddingHorizontal: space.headerX, paddingBottom: 10, backgroundColor: c.headerBg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexShrink: 1 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  funnelWrap: { padding: 2 },
  filterDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: c.teal,
    borderWidth: 1.5,
    borderColor: c.bg,
  },
  caret: { marginLeft: 7, marginBottom: 2 },
  sub: { marginTop: 3 },
});
