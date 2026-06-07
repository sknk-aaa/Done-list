import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ItemWithTag } from '@/db/queries';
import { Bell, Note } from '@/icons';
import { font, radius } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

import { CheckRing } from './CheckRing';

type Props = {
  item: ItemWithTag;
  showTime: boolean;
  onToggle: () => void;
  onPress: () => void;
};

export function TaskRow({ item, showTime, onToggle, onPress }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const tagColor = item.tag?.color ?? c.chevron;
  const hasSub = !!item.tag || !!item.memo;
  const showTimeVal = showTime && !!item.time;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <CheckRing done={item.isCompleted} color={tagColor} onToggle={onToggle} />
      <View style={styles.main}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        {hasSub && (
          <View style={styles.sub}>
            {item.tag && (
              <View style={styles.tagWrap}>
                <View style={[styles.dot, { backgroundColor: item.tag.color }]} />
                <Text style={[styles.tagName, { color: item.tag.color }]}>{item.tag.name}</Text>
              </View>
            )}
            {item.memo ? <Note size={13} color="#B3B8BD" /> : null}
          </View>
        )}
      </View>
      {showTimeVal && (
        <View style={styles.timeWrap}>
          {item.notifyEnabled && <Bell size={12} color={c.teal} />}
          <Text style={styles.time}>{item.time}</Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.surface,
    borderRadius: radius.card,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: { backgroundColor: c.bgSoft },
  main: { flex: 1, gap: 5 },
  title: { fontSize: 14.5, fontWeight: '600', color: c.ink2 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tagName: { fontSize: font.size.caption, fontWeight: '600' },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: 11.5, fontWeight: '600', color: c.muted, fontVariant: ['tabular-nums'] },
});
