import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { useTags } from '@/data/useData';
import { Check } from '@/icons';
import { useAppStore, type FilterStatus } from '@/state/store';
import { font } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

import { BottomSheet } from './BottomSheet';
import { Segmented } from './Segmented';
import { SheetHeader } from './SheetHeader';

export function FilterSheet() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { t } = useTranslation();
  const filterOpen = useAppStore((s) => s.filterOpen);
  const setFilterOpen = useAppStore((s) => s.setFilterOpen);
  const filter = useAppStore((s) => s.filter);
  const setFilterStatus = useAppStore((s) => s.setFilterStatus);
  const setFilterTags = useAppStore((s) => s.setFilterTags);
  const resetFilter = useAppStore((s) => s.resetFilter);
  const tags = useTags();

  // Model: empty tagIds = no tag filter (all shown). Checking a tag narrows the
  // view to only the checked tags. Nothing is checked by default.
  const isChecked = (id: number) => filter.tagIds.includes(id);
  const toggleTag = (id: number) => {
    const next = filter.tagIds.includes(id)
      ? filter.tagIds.filter((x) => x !== id)
      : [...filter.tagIds, id];
    setFilterTags(next);
  };

  const statusSegments: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: t('filter.statusAll') },
    { value: 'done', label: t('filter.statusDone') },
    { value: 'todo', label: t('filter.statusTodo') },
  ];

  return (
    <BottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)}>
      <SheetHeader
        left={{ label: t('common.reset'), onPress: resetFilter, muted: true }}
        title={t('filter.title')}
        right={{ label: t('common.done'), onPress: () => setFilterOpen(false) }}
      />
      <View style={styles.body}>
        <Text style={styles.label}>{t('filter.status')}</Text>
        <Segmented segments={statusSegments} value={filter.status} onChange={setFilterStatus} />

        <Text style={styles.label}>{t('filter.tags')}</Text>
        {tags.map((tg) => {
          const on = isChecked(tg.id);
          return (
            <Pressable key={tg.id} style={styles.row} onPress={() => toggleTag(tg.id)}>
              <View style={styles.left}>
                <View style={[styles.dot, { backgroundColor: tg.color }]} />
                <Text style={styles.name}>{tg.name}</Text>
              </View>
              <View style={[styles.check, on && styles.checkOn]}>{on && <Check size={14} color="#fff" strokeWidth={3.2} />}</View>
            </Pressable>
          );
        })}
        <View style={styles.bottomPad} />
      </View>
    </BottomSheet>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 6 },
  label: { fontSize: font.size.body, color: c.muted, marginTop: 18, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: font.size.title, color: c.ink },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: c.teal, borderColor: c.teal },
  bottomPad: { height: 24 },
});
