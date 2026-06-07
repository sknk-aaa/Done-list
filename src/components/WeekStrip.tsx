import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, runOnJS, ZoomIn } from 'react-native-reanimated';

import { addDaysISO, getTodayISO, parseISO } from '@/lib/date';
import { useColors, type Colors } from '@/theme/theme';
import { font } from '@/theme/tokens';

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'];
const DOW_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const dowOf = (iso: string) => {
  const { y, m0, d } = parseISO(iso);
  return new Date(Date.UTC(y, m0, d)).getUTCDay(); // 0=Sun
};

type Props = {
  selectedDate: string;
  lang: 'ja' | 'en';
  onSelect: (iso: string) => void;
  onShiftWeek: (delta: number) => void;
};

/** Tap the daily date to reveal this: a Sunday-start week row. Swipe left/right = ±1 week. */
export function WeekStrip({ selectedDate, lang, onSelect, onShiftWeek }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const today = getTodayISO();
  const start = addDaysISO(selectedDate, -dowOf(selectedDate));
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
  const labels = lang === 'ja' ? DOW_JA : DOW_EN;

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -40) runOnJS(onShiftWeek)(7);
      else if (e.translationX > 40) runOnJS(onShiftWeek)(-7);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.strip}>
        {/* key by week start → fades in when the week changes */}
        <Animated.View key={start} entering={FadeIn.duration(200)} style={styles.row}>
          {days.map((d, i) => {
            const sel = d === selectedDate;
            const isToday = d === today;
            return (
              <Pressable key={d} style={styles.cell} onPress={() => onSelect(d)} hitSlop={4}>
                <Text style={[styles.dow, i === 0 && styles.sun]}>{labels[i]}</Text>
                <View style={styles.numWrap}>
                  {sel && (
                    <Animated.View
                      key={d}
                      entering={ZoomIn.springify().damping(12).stiffness(170)}
                      style={styles.selCircle}
                    />
                  )}
                  <Text
                    style={[
                      styles.num,
                      sel && styles.numSel,
                      isToday && !sel && styles.numToday,
                      i === 0 && !sel && styles.sun,
                    ]}
                  >
                    {parseISO(d).d}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    strip: {
      paddingHorizontal: 10,
      paddingTop: 2,
      paddingBottom: 10,
      backgroundColor: c.headerBg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line,
    },
    row: { flexDirection: 'row' },
    cell: { flex: 1, alignItems: 'center', gap: 5 },
    dow: { fontSize: 11, color: c.muted, fontWeight: '600' },
    sun: { color: c.red },
    numWrap: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    selCircle: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 15, backgroundColor: c.teal },
    num: { fontSize: font.size.body, fontWeight: '600', color: c.ink2 },
    numSel: { color: '#fff', fontWeight: '700' },
    numToday: { color: c.teal, fontWeight: '700' },
  });
