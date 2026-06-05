import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { AppHeader, HeaderCaret } from '@/components/AppHeader';
import { MonthGrid, type GridCell } from '@/components/MonthGrid';
import { useMonthItems } from '@/data/useData';
import type { ItemWithTag } from '@/db/types';
import {
  MONTHS_EN,
  WEEKDAYS_EN,
  WEEKDAYS_JA,
  daysInMonth,
  dateToISO,
  firstWeekday,
  getTodayISO,
} from '@/lib/date';
import { matchesFilter } from '@/lib/filter';
import { isFilterActive, useAppStore } from '@/state/store';
import { color, font } from '@/theme/tokens';

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export function MonthScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';

  const viewYear = useAppStore((s) => s.viewYear);
  const viewMonth = useAppStore((s) => s.viewMonth);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const filter = useAppStore((s) => s.filter);
  const setFilterOpen = useAppStore((s) => s.setFilterOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const openDatePop = useAppStore((s) => s.openDatePop);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setView = useAppStore((s) => s.setView);
  const shiftMonth = useAppStore((s) => s.shiftMonth);

  const onSwipeMonth = useCallback((dir: number) => shiftMonth(dir > 0 ? -1 : 1), [shiftMonth]);
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      'worklet';
      if (Math.abs(e.translationX) > 55 && Math.abs(e.translationX) > 1.2 * Math.abs(e.translationY)) {
        runOnJS(onSwipeMonth)(e.translationX > 0 ? 1 : -1);
      }
    });

  const first = firstWeekday(viewYear, viewMonth);
  const dim = daysInMonth(viewYear, viewMonth);
  const total = first + dim;
  const tail = (7 - (total % 7)) % 7;
  const cellCount = total + tail;

  const startDate = new Date(viewYear, viewMonth, 1 - first);
  const lastDate = new Date(viewYear, viewMonth, dim + tail);
  const startISO = dateToISO(startDate);
  const endISO = dateToISO(lastDate);

  const rangeItems = useMonthItems(startISO, endISO);

  const byDay = new Map<string, ItemWithTag[]>();
  for (const it of rangeItems) {
    if (!matchesFilter(it, filter)) continue;
    const arr = byDay.get(it.date) ?? [];
    arr.push(it);
    byDay.set(it.date, arr);
  }

  const todayISO = getTodayISO();
  const cells: GridCell[] = [];
  for (let i = 0; i < cellCount; i++) {
    const dt = new Date(viewYear, viewMonth, 1 - first + i);
    const iso = dateToISO(dt);
    const out = dt.getMonth() !== viewMonth;
    cells.push({
      day: dt.getDate(),
      out,
      iso,
      items: byDay.get(iso) ?? [],
      isToday: iso === todayISO,
      isSelected: iso === selectedDate && !out,
    });
  }
  const weeks = chunk(cells, 7);

  const ymLabel = lang === 'ja' ? `${viewYear} / ${viewMonth + 1}月` : `${MONTHS_EN[viewMonth]} ${viewYear}`;
  const weekdays = lang === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN;

  const left = (
    <Pressable style={styles.ym} onPress={() => openDatePop('month')} hitSlop={6}>
      <Text style={styles.ymText}>{ymLabel}</Text>
      <HeaderCaret />
    </Pressable>
  );

  const onDayPress = (cell: GridCell) => {
    setSelectedDate(cell.iso);
    setView('daily');
  };

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.screen}>
        <AppHeader
          left={left}
          filterActive={isFilterActive(filter)}
          onFilter={() => setFilterOpen(true)}
          onMenu={() => setDrawerOpen(true)}
        />
        <View style={styles.dow}>
          {weekdays.map((w, i) => (
            <Text key={i} style={[styles.dowText, i === 0 && styles.dowSun]}>
              {w}
            </Text>
          ))}
        </View>
        <MonthGrid weeks={weeks} filterActive={isFilterActive(filter)} onDayPress={onDayPress} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  ym: { flexDirection: 'row', alignItems: 'center' },
  ymText: { fontSize: font.size.h2, fontWeight: '600', color: '#565B60' },
  dow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 2, paddingBottom: 8 },
  dowText: { flex: 1, textAlign: 'center', fontSize: 15, color: '#8A8F94' },
  dowSun: { color: '#8A8F94' },
});
