import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ReorderableList, {
  type ReorderableListReorderEvent,
  reorderItems as arrayReorder,
} from 'react-native-reorderable-list';

import { AppHeader, HeaderCaret } from '@/components/AppHeader';
import { Fab } from '@/components/Fab';
import { TaskRow } from '@/components/TaskRow';
import { Pencil, Undo } from '@/icons';
import { useDailyItems } from '@/data/useData';
import type { ItemWithTag } from '@/db/types';
import { formatLong, getTodayISO } from '@/lib/date';
import { matchesFilter } from '@/lib/filter';
import { reorderTasks, setComplete } from '@/lib/taskActions';
import { isFilterActive, useAppStore } from '@/state/store';
import { color, font, space } from '@/theme/tokens';

const ts = (v: unknown): number => (v instanceof Date ? v.getTime() : typeof v === 'number' ? v : 0);

export function DailyScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';

  const selectedDate = useAppStore((s) => s.selectedDate);
  const showTime = useAppStore((s) => s.showTime);
  const filter = useAppStore((s) => s.filter);
  const openAddSheet = useAppStore((s) => s.openAddSheet);
  const openEditSheet = useAppStore((s) => s.openEditSheet);
  const setFilterOpen = useAppStore((s) => s.setFilterOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const openDatePop = useAppStore((s) => s.openDatePop);
  const goToday = useAppStore((s) => s.goToday);
  const resetFilter = useAppStore((s) => s.resetFilter);
  const swipeAction = useAppStore((s) => s.swipeAction);
  const shiftDay = useAppStore((s) => s.shiftDay);
  const setView = useAppStore((s) => s.setView);

  const onSwipe = useCallback(
    (dir: number) => {
      // dir: +1 = swiped right, -1 = swiped left
      if (swipeAction === 'date') shiftDay(dir > 0 ? -1 : 1);
      else if (dir < 0) setView('month');
    },
    [swipeAction, shiftDay, setView],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      'worklet';
      if (Math.abs(e.translationX) > 55 && Math.abs(e.translationX) > 1.2 * Math.abs(e.translationY)) {
        runOnJS(onSwipe)(e.translationX > 0 ? 1 : -1);
      }
    });

  const all = useDailyItems(selectedDate);
  const visible = useMemo(() => all.filter((it) => matchesFilter(it, filter)), [all, filter]);
  const doneCount = visible.filter((it) => it.isCompleted).length;

  const isToday = selectedDate === getTodayISO();
  const active = isFilterActive(filter);

  // Optimistic copy so a drag-drop shows instantly; re-sync whenever the DB
  // content changes (order, completion, edits, add/delete).
  const sig = visible.map((i) => `${i.id}:${i.sortOrder}:${i.isCompleted ? 1 : 0}:${ts(i.updatedAt)}`).join('|');
  const [rows, setRows] = useState<ItemWithTag[]>(visible);
  useEffect(() => {
    setRows(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const next = arrayReorder(rows, from, to);
    setRows(next);
    void reorderTasks(next.map((i) => i.id));
  };

  // Gentle cross-fade when the day changes (swipe / date tap / back-to-today).
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.value = 0.25;
    fade.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [selectedDate, fade]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

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
          <Undo size={13} color={color.teal} strokeWidth={2.4} />
          <Text style={styles.backToday}>{t('daily.backToToday')}</Text>
        </Pressable>
      )}
      <Text style={styles.statusDot}> · </Text>
      <Text style={styles.progress}>{t('daily.progress', { done: doneCount, total: visible.length })}</Text>
    </View>
  );

  const filterParts: string[] = [];
  if (filter.status === 'done') filterParts.push(t('filter.doneOnly'));
  if (filter.status === 'todo') filterParts.push(t('filter.todoOnly'));
  if (filter.tagIds.length > 0) filterParts.push(t('filter.tagCount', { count: filter.tagIds.length }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.screen}>
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

      <Animated.View style={[styles.listWrap, fadeStyle]}>
        <ReorderableList
          data={rows}
          keyExtractor={(it) => String(it.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onReorder={handleReorder}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <TaskRow
              item={item}
              showTime={showTime}
              draggable={!active}
              onToggle={() => setComplete(item, !item.isCompleted)}
              onPress={() => openEditSheet(item)}
            />
          )}
          ListEmptyComponent={
            active ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('daily.empty')}</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Pencil size={28} color={color.teal} strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>{t('daily.emptyDay')}</Text>
                <Text style={styles.emptyHint}>{t('daily.emptyDayHint')}</Text>
              </View>
            )
          }
        />
      </Animated.View>

      <Fab onPress={() => openAddSheet()} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  dhead: { flexDirection: 'row', alignItems: 'center' },
  dhMain: { fontSize: font.size.h2, fontWeight: '700', color: color.ink },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  todayLabel: { fontSize: font.size.caption, fontWeight: '600', color: color.teal },
  backTodayRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  backToday: { fontSize: font.size.caption, fontWeight: '700', color: color.teal },
  statusDot: { fontSize: font.size.caption, color: color.muted },
  progress: { fontSize: font.size.caption, fontWeight: '500', color: color.muted },

  filterBar: {
    marginHorizontal: space.gutter,
    marginBottom: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#E6F6F4',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBarText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0F8A7C' },
  filterClear: { fontSize: 13, fontWeight: '700', color: color.teal, marginLeft: 12 },

  listWrap: { flex: 1 },
  list: { flex: 1, backgroundColor: color.bgSoft },
  listContent: { paddingHorizontal: space.screenX, flexGrow: 1 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: color.line },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 64, paddingHorizontal: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#8A9097', marginBottom: 6 },
  emptyHint: { fontSize: 14, color: '#B4B9BD', textAlign: 'center' },
  emptyText: { fontSize: 15, color: '#B4B9BD' },
});
