import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ItemWithTag } from '@/db/queries';
import { color } from '@/theme/tokens';

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
                style={[styles.cell, cell.isSelected && styles.cellSelected]}
                onPress={() => !cell.out && onDayPress(cell)}
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

const styles = StyleSheet.create({
  grid: { flex: 1, paddingHorizontal: 5, overflow: 'hidden' },
  week: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0.5,
    borderColor: '#ECEEF0',
    paddingTop: 5,
    paddingBottom: 4,
    paddingHorizontal: 1.5,
    gap: 2.5,
    overflow: 'hidden',
  },
  cellSelected: { borderWidth: 1.5, borderColor: color.teal, borderRadius: 10, backgroundColor: '#F2FBFA' },
  dnum: { fontSize: 14, fontWeight: '600', color: '#33383D', lineHeight: 14, paddingLeft: 3, marginBottom: 2 },
  sun: { color: color.red },
  outNum: { color: '#C4C8CC' },
  todayPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(72,193,168,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginLeft: 1,
  },
  todayNum: { fontSize: 14, fontWeight: '700', color: color.teal, lineHeight: 14 },
  more: { fontSize: 11, color: '#9AA0A6', textAlign: 'center', fontWeight: '600', marginTop: 1 },
});
