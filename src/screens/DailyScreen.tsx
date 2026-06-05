import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { AppHeader, HeaderCaret } from '@/components/AppHeader';
import { Fab } from '@/components/Fab';
import { TaskRow } from '@/components/TaskRow';
import { useDailyItems } from '@/data/useData';
import { formatLong, getTodayISO } from '@/lib/date';
import { matchesFilter } from '@/lib/filter';
import { setComplete } from '@/lib/taskActions';
import { isFilterActive, useAppStore } from '@/state/store';
import { color, font, space } from '@/theme/tokens';

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
  const visible = all.filter((it) => matchesFilter(it, filter));
  const doneCount = visible.filter((it) => it.isCompleted).length;

  const isToday = selectedDate === getTodayISO();
  const active = isFilterActive(filter);

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
        <Pressable onPress={goToday} hitSlop={6}>
          <Text style={styles.backToday}>↩ {t('daily.backToToday')}</Text>
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

      <FlatList
        data={visible}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <TaskRow
            item={item}
            showTime={showTime}
            onToggle={() => setComplete(item, !item.isCompleted)}
            onPress={() => openEditSheet(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{active ? t('daily.empty') : t('daily.emptyDay')}</Text>
          </View>
        }
      />

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

  listContent: { paddingHorizontal: space.screenX, flexGrow: 1 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: color.line },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyText: { fontSize: 15, color: '#B4B9BD' },
});
