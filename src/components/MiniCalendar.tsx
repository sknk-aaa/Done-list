import { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight } from '@/icons';
import {
  MONTHS_EN,
  WEEKDAYS_EN,
  WEEKDAYS_JA,
  daysInMonth,
  firstWeekday,
  parseISO,
  toISO,
} from '@/lib/date';
import { font } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

type Props = {
  value: string; // selected ISO
  todayISO?: string;
  lang: 'ja' | 'en';
  onPick: (iso: string) => void;
};

export function MiniCalendar({ value, todayISO, lang, onPick }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const init = parseISO(value);
  const [y, setY] = useState(init.y);
  const [m, setM] = useState(init.m0);

  const first = firstWeekday(y, m);
  const dim = daysInMonth(y, m);
  const weekdays = lang === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN;
  const title = lang === 'ja' ? `${y}年${m + 1}月` : `${MONTHS_EN[m]} ${y}`;

  const shift = (d: number) => {
    const total = y * 12 + m + d;
    setY(Math.floor(total / 12));
    setM(((total % 12) + 12) % 12);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable onPress={() => shift(-1)} hitSlop={8} style={styles.nav}>
          <ChevronLeft size={18} color="#9AA0A6" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={8} style={styles.nav}>
          <ChevronRight size={18} color="#9AA0A6" />
        </Pressable>
      </View>
      <View style={styles.row}>
        {weekdays.map((w, i) => (
          <Text key={i} style={[styles.dow, i === 0 && styles.sun]}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (d == null) return <View key={i} style={styles.cell} />;
          const iso = toISO(y, m, d);
          const selected = iso === value;
          const today = iso === todayISO;
          return (
            <Pressable key={i} style={styles.cell} onPress={() => onPick(iso)}>
              <View style={[styles.day, selected && styles.daySelected]}>
                <Text
                  style={[
                    styles.dayText,
                    today && !selected && styles.dayToday,
                    selected && styles.daySelectedText,
                  ]}
                >
                  {d}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  wrap: { paddingVertical: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 6 },
  nav: { padding: 4 },
  title: { fontSize: font.size.title, fontWeight: '700', color: c.ink },
  row: { flexDirection: 'row' },
  dow: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, color: c.muted, paddingBottom: 4 },
  sun: { color: c.red },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: c.teal },
  dayText: { fontSize: font.size.body, color: c.ink },
  dayToday: { color: c.teal, fontWeight: '700' },
  daySelectedText: { color: c.onAccent, fontWeight: '700' },
});
