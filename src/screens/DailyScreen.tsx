import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { AppHeader, HeaderCaret } from '@/components/AppHeader';
import { Fab } from '@/components/Fab';
import { TaskRow } from '@/components/TaskRow';
import { Pencil, Undo } from '@/icons';
import { useDailyItems } from '@/data/useData';
import { addDaysISO, formatLong, getTodayISO } from '@/lib/date';
import { matchesFilter } from '@/lib/filter';
import { setComplete } from '@/lib/taskActions';
import { isFilterActive, useAppStore } from '@/state/store';
import { useColors, type Colors } from '@/theme/theme';
import { font, space } from '@/theme/tokens';

const DAY_MS = 86400000;
const RANGE = 600; // pages span anchor ± RANGE days

const isoToUTC = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const diffDays = (aISO: string, bISO: string) => Math.round((isoToUTC(bISO) - isoToUTC(aISO)) / DAY_MS);

/** One day's task list — self-contained so paging never swaps data under it. */
function DayPage({ date, width, height }: { date: string; width: number; height: number }) {
  const { t } = useTranslation();
  const showTime = useAppStore((s) => s.showTime);
  const filter = useAppStore((s) => s.filter);
  const openEditSheet = useAppStore((s) => s.openEditSheet);
  const goToday = useAppStore((s) => s.goToday);

  const all = useDailyItems(date);
  const visible = useMemo(() => all.filter((it) => matchesFilter(it, filter)), [all, filter]);
  const active = isFilterActive(filter);
  const isToday = date === getTodayISO();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={{ width, height }}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={visible.length > 6}
      >
        {visible.length === 0 ? (
          <View style={styles.empty}>
            {active ? (
              <Text style={styles.emptyText}>{t('daily.empty')}</Text>
            ) : (
              <>
                <View style={styles.emptyIcon}>
                  <Pencil size={28} color={c.teal} strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>{t('daily.emptyDay')}</Text>
                <Text style={styles.emptyHint}>{t('daily.emptyDayHint')}</Text>
              </>
            )}
          </View>
        ) : (
          <>
            {visible.map((item) => (
              <Fragment key={item.id}>
                <TaskRow
                  item={item}
                  showTime={showTime}
                  onToggle={() => setComplete(item, !item.isCompleted)}
                  onPress={() => openEditSheet(item)}
                />
              </Fragment>
            ))}
            {!isToday && (
              <Pressable style={styles.todayBtn} onPress={goToday}>
                <View style={date < getTodayISO() ? styles.flip : undefined}>
                  <Undo size={15} color={c.teal} strokeWidth={2.4} />
                </View>
                <Text style={styles.todayBtnText}>{t('daily.backToToday')}</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

export function DailyScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const { width } = useWindowDimensions();

  const selectedDate = useAppStore((s) => s.selectedDate);
  const filter = useAppStore((s) => s.filter);
  const openAddSheet = useAppStore((s) => s.openAddSheet);
  const setFilterOpen = useAppStore((s) => s.setFilterOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const openDatePop = useAppStore((s) => s.openDatePop);
  const goToday = useAppStore((s) => s.goToday);
  const resetFilter = useAppStore((s) => s.resetFilter);
  const swipeAction = useAppStore((s) => s.swipeAction);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setView = useAppStore((s) => s.setView);
  const sheetOpen = useAppStore((s) => s.sheet.mode !== null);

  const anchor = useRef(getTodayISO()).current;
  const dateForIndex = useCallback((i: number) => addDaysISO(anchor, i - RANGE), [anchor]);
  const indexForDate = useCallback((d: string) => diffDays(anchor, d) + RANGE, [anchor]);

  const listRef = useRef<FlatList<number>>(null);
  const indices = useMemo(() => Array.from({ length: RANGE * 2 + 1 }, (_, i) => i), []);
  const curIndexRef = useRef(indexForDate(selectedDate));
  const [areaH, setAreaH] = useState(0);

  // External date changes (header tap / today / month) → scroll to that day.
  useEffect(() => {
    const idx = indexForDate(selectedDate);
    if (idx !== curIndexRef.current) {
      const near = Math.abs(idx - curIndexRef.current) <= 1;
      curIndexRef.current = idx;
      listRef.current?.scrollToIndex({ index: idx, animated: near });
    }
  }, [selectedDate, indexForDate]);

  const onMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      curIndexRef.current = idx;
      const d = dateForIndex(idx);
      if (d !== selectedDate) setSelectedDate(d);
    },
    [width, dateForIndex, selectedDate, setSelectedDate],
  );

  // tab mode: horizontal swipe switches to the month view.
  const viewPan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-22, 22])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -32 && Math.abs(e.translationX) > Math.abs(e.translationY)) {
        runOnJS(setView)('month');
      }
    });

  // header counts use the current day.
  const curAll = useDailyItems(selectedDate);
  const curVisible = useMemo(() => curAll.filter((it) => matchesFilter(it, filter)), [curAll, filter]);
  const doneCount = curVisible.filter((it) => it.isCompleted).length;
  const isToday = selectedDate === getTodayISO();
  const active = isFilterActive(filter);
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const left = (
    <Pressable style={styles.dhead} onPress={() => openDatePop('daily')} hitSlop={6}>
      <Text style={styles.dhMain}>{formatLong(selectedDate, lang)}</Text>
      <HeaderCaret />
    </Pressable>
  );

  const sub = (
    <View style={styles.statusRow}>
      {isToday ? (
        <Text style={styles.todayLabel}>{t('daily.today')}</Text>
      ) : (
        <Pressable onPress={goToday} hitSlop={6} style={styles.backTodayRow}>
          <View style={selectedDate < getTodayISO() ? styles.flip : undefined}>
            <Undo size={13} color={c.teal} strokeWidth={2.4} />
          </View>
          <Text style={styles.backToday}>{t('daily.backToToday')}</Text>
        </Pressable>
      )}
      <Text style={styles.statusDot}> · </Text>
      <Text style={styles.progress}>{t('daily.progress', { done: doneCount, total: curVisible.length })}</Text>
    </View>
  );

  const filterParts: string[] = [];
  if (filter.status === 'done') filterParts.push(t('filter.doneOnly'));
  if (filter.status === 'todo') filterParts.push(t('filter.todoOnly'));
  if (filter.tagIds.length > 0) filterParts.push(t('filter.tagCount', { count: filter.tagIds.length }));

  const header = (
    <>
      <AppHeader
        left={left}
        sub={sub}
        filterActive={active}
        onFilter={() => setFilterOpen(true)}
        onMenu={() => setDrawerOpen(true)}
      />
      {active && (
        <View style={styles.filterBar}>
          <Text style={styles.filterBarText} numberOfLines={1}>
            {t('filter.active')} · {filterParts.join(' · ')}
          </Text>
          <Pressable onPress={resetFilter} hitSlop={8}>
            <Text style={styles.filterClear}>{t('filter.clear')}</Text>
          </Pressable>
        </View>
      )}
    </>
  );

  if (swipeAction !== 'date') {
    return (
      <GestureDetector gesture={viewPan}>
        <View style={styles.screen}>
          {header}
          <View style={styles.listWrap} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
            <DayPage date={selectedDate} width={width} height={areaH} />
          </View>
          {!sheetOpen && <Fab onPress={() => openAddSheet()} />}
        </View>
      </GestureDetector>
    );
  }

  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.listWrap} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
        <FlatList
          ref={listRef}
          data={indices}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => String(i)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          initialScrollIndex={indexForDate(selectedDate)}
          windowSize={5}
          initialNumToRender={1}
          maxToRenderPerBatch={3}
          removeClippedSubviews={false}
          onMomentumScrollEnd={onMomentumEnd}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => <DayPage date={dateForIndex(item)} width={width} height={areaH} />}
        />
      </View>
      {!sheetOpen && <Fab onPress={() => openAddSheet()} />}
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  dhead: { flexDirection: 'row', alignItems: 'center' },
  dhMain: { fontSize: 18, fontWeight: '700', color: c.ink },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  todayLabel: { fontSize: font.size.caption, fontWeight: '600', color: c.teal },
  backTodayRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  backToday: { fontSize: font.size.caption, fontWeight: '700', color: c.teal },
  statusDot: { fontSize: font.size.caption, color: c.muted },
  progress: { fontSize: font.size.caption, fontWeight: '500', color: c.muted },

  filterBar: {
    marginHorizontal: space.gutter,
    marginBottom: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: c.filterBg,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBarText: { flex: 1, fontSize: 13, fontWeight: '600', color: c.filterText },
  filterClear: { fontSize: 13, fontWeight: '700', color: c.teal, marginLeft: 12 },

  listWrap: { flex: 1 },
  list: { flex: 1, backgroundColor: c.listBg },
  listContent: { paddingHorizontal: space.screenX, paddingTop: 12, flexGrow: 1 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.line },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 22,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: c.tealTint,
  },
  todayBtnText: { fontSize: font.size.body, fontWeight: '700', color: c.teal },
  flip: { transform: [{ scaleX: -1 }] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 96, paddingHorizontal: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: c.muted, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: c.faint, textAlign: 'center' },
  emptyText: { fontSize: 15, color: c.faint },
});
