import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ItemWithTag } from '@/db/queries';
import { useColors, type Colors } from '@/theme/theme';

import { Chip } from './Chip';

const TAGLESS = '#C8CCD0';
const MAX_CHIPS = 5;

export type GridCell = {
  day: number;
  out: boolean;
  iso: string;
  items: ItemWithTag[];
  isToday: boolean;
  isSelected: boolean;
};

type Props = {
  weeks: GridCell[][];
  filterActive: boolean;
  onDayPress: (cell: GridCell) => void;
};

export function MonthGrid({ weeks, filterActive, onDayPress }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.grid}>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((cell, ci) => {
            const shown = cell.items.slice(0, MAX_CHIPS);
            const overflow = cell.items.length - shown.length;
            const isSunday = ci === 0;
            return (
              <Pressable
                key={ci}
                style={({ pressed }) => [styles.cell, cell.isSelected && styles.cellSelected, pressed && styles.cellPressed]}
                onPress={() => !cell.out && onDayPress(cell)}
                accessibilityRole="button"
                accessibilityLabel={`${cell.day}日${cell.items.length > 0 ? `・${cell.items.length}件` : ''}`}
                accessibilityState={{ selected: cell.isSelected }}
              >
                {cell.isToday ? (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayNum}>{cell.day}</Text>
                  </View>
                ) : (
                  <Text style={[styles.dnum, isSunday && styles.sun, cell.out && styles.outNum]}>{cell.day}</Text>
                )}
                {shown.map((it) => (
                  <Chip key={it.id} label={it.title} color={it.tag?.color ?? TAGLESS} dimmed={cell.out} />
                ))}
                {overflow > 0 && !filterActive && <Text style={styles.more}>+{overflow}</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  grid: { flex: 1, paddingHorizontal: 5, overflow: 'hidden' },
  week: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0.5,
    borderColor: c.line,
    paddingTop: 5,
    paddingBottom: 4,
    paddingHorizontal: 1.5,
    gap: 2.5,
    overflow: 'hidden',
  },
  cellSelected: { borderWidth: 1.5, borderColor: c.teal, borderRadius: 10, backgroundColor: c.selectedCell },
  cellPressed: { opacity: 0.55 },
  dnum: { fontSize: 14, fontWeight: '600', color: c.ink2, height: 20, lineHeight: 20, paddingLeft: 3, marginBottom: 2 },
  sun: { color: c.red },
  outNum: { color: c.faint },
  todayPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginLeft: 1,
  },
  todayNum: { fontSize: 14, fontWeight: '700', color: c.teal, lineHeight: 14 },
  more: { fontSize: 11, color: c.muted, textAlign: 'center', fontWeight: '600', marginTop: 1 },
});
