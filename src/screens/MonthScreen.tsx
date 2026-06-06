import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { AppHeader, HeaderCaret } from '@/components/AppHeader';
import { MonthGrid, type GridCell } from '@/components/MonthGrid';
import { ChevronLeft, ChevronRight } from '@/icons';
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

function addMonth(y: number, m0: number, delta: number) {
  const t = y * 12 + m0 + delta;
  return { y: Math.floor(t / 12), m0: ((t % 12) + 12) % 12 };
}

function monthMeta(y: number, m0: number) {
  const first = firstWeekday(y, m0);
  const dim = daysInMonth(y, m0);
  const total = first + dim;
  const tail = (7 - (total % 7)) % 7;
  const cellCount = total + tail;
  const startISO = dateToISO(new Date(y, m0, 1 - first));
  const endISO = dateToISO(new Date(y, m0, dim + tail));
  return { first, cellCount, startISO, endISO };
}

export function MonthScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const { width } = useWindowDimensions();

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
  const swipeAction = useAppStore((s) => s.swipeAction);

  const scrollRef = useRef<ScrollView>(null);
  const [areaH, setAreaH] = useState(0);

  // Three panels (prev / current / next) for a paging carousel.
  const metas = [-1, 0, 1].map((off) => {
    const { y, m0 } = addMonth(viewYear, viewMonth, off);
    return { off, y, m0, ...monthMeta(y, m0) };
  });

  const rangeItems = useMonthItems(metas[0].startISO, metas[2].endISO);
  const byDay = new Map<string, ItemWithTag[]>();
  for (const it of rangeItems) {
    if (!matchesFilter(it, filter)) continue;
    const arr = byDay.get(it.date) ?? [];
    arr.push(it);
    byDay.set(it.date, arr);
  }

  const todayISO = getTodayISO();
  const buildCells = (y: number, m0: number, first: number, cellCount: number): GridCell[] => {
    const cells: GridCell[] = [];
    for (let i = 0; i < cellCount; i++) {
      const dt = new Date(y, m0, 1 - first + i);
      const iso = dateToISO(dt);
      const out = dt.getMonth() !== m0;
      cells.push({
        day: dt.getDate(),
        out,
        iso,
        items: byDay.get(iso) ?? [],
        isToday: iso === todayISO,
        isSelected: iso === selectedDate && !out,
      });
    }
    return cells;
  };
  const panels = metas.map((mm) => ({
    key: `${mm.y}-${mm.m0}`,
    weeks: chunk(buildCells(mm.y, mm.m0, mm.first, mm.cellCount), 7),
  }));

  const recenter = useCallback(() => {
    scrollRef.current?.scrollTo({ x: width, animated: false });
  }, [width]);

  // Commit + recenter happen in the same JS handler → no cross-thread flicker.
  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / width);
      if (page === 1) return;
      shiftMonth(page - 1);
      recenter();
    },
    [width, shiftMonth, recenter],
  );

  const go = useCallback(
    (delta: number) => {
      if (swipeAction === 'date') scrollRef.current?.scrollTo({ x: width + delta * width, animated: true });
      else shiftMonth(delta);
    },
    [swipeAction, width, shiftMonth],
  );

  // tab mode: horizontal swipe (right) switches back to the daily view.
  const viewPan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-22, 22])
    .onEnd((e) => {
      'worklet';
      if (e.translationX > 32 && Math.abs(e.translationX) > Math.abs(e.translationY)) {
        runOnJS(setView)('daily');
      }
    });

  const ymLabel = lang === 'ja' ? `${viewYear} / ${viewMonth + 1}月` : `${MONTHS_EN[viewMonth]} ${viewYear}`;
  const weekdays = lang === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN;

  const left = (
    <View style={styles.ymBar}>
      <Pressable onPress={() => go(-1)} hitSlop={16} style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}>
        <ChevronLeft size={22} color="#8A8F94" strokeWidth={2.4} />
      </Pressable>
      <Pressable style={styles.ym} onPress={() => openDatePop('month')} hitSlop={6}>
        <Text style={styles.ymText}>{ymLabel}</Text>
        <HeaderCaret />
      </Pressable>
      <Pressable onPress={() => go(1)} hitSlop={16} style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}>
        <ChevronRight size={22} color="#8A8F94" strokeWidth={2.4} />
      </Pressable>
    </View>
  );

  const onDayPress = (cell: GridCell) => {
    setSelectedDate(cell.iso);
    setView('daily');
  };

  return (
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
      {swipeAction === 'date' ? (
        <View style={styles.clip} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: width, y: 0 }}
            onMomentumScrollEnd={onMomentumEnd}
            onLayout={recenter}
          >
            {panels.map((p) => (
              <View key={p.key} style={{ width, height: areaH }}>
                <MonthGrid weeks={p.weeks} filterActive={isFilterActive(filter)} onDayPress={onDayPress} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <GestureDetector gesture={viewPan}>
          <View style={styles.clip}>
            <MonthGrid weeks={panels[1].weeks} filterActive={isFilterActive(filter)} onDayPress={onDayPress} />
          </View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  ymBar: { flexDirection: 'row', alignItems: 'center' },
  arrow: { paddingVertical: 6, paddingHorizontal: 6, borderRadius: 10 },
  arrowPressed: { backgroundColor: color.bgSoft },
  clip: { flex: 1 },
  ym: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  ymText: { fontSize: font.size.h2, fontWeight: '600', color: '#565B60' },
  dow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 2, paddingBottom: 8 },
  dowText: { flex: 1, textAlign: 'center', fontSize: 15, color: '#8A8F94' },
  dowSun: { color: '#8A8F94' },
});
