import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import type { ItemWithTag } from '@/db/queries';
import { Bell, Note } from '@/icons';
import { color, font } from '@/theme/tokens';

import { CheckRing } from './CheckRing';

const TAGLESS_RING = '#CFD3D6';

type Props = {
  item: ItemWithTag;
  showTime: boolean;
  draggable?: boolean;
  onToggle: () => void;
  onPress: () => void;
};

export function TaskRow({ item, showTime, draggable, onToggle, onPress }: Props) {
  const drag = useReorderableDrag();
  const tagColor = item.tag?.color ?? TAGLESS_RING;
  const hasSub = !!item.tag || !!item.memo;
  const showTimeVal = showTime && !!item.time;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={draggable ? drag : undefined}
      delayLongPress={150}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
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
          {item.notifyEnabled && <Bell size={12} color={color.teal} />}
          <Text style={styles.time}>{item.time}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 17 },
  pressed: { backgroundColor: color.bgSoft },
  main: { flex: 1, gap: 6 },
  title: { fontSize: font.size.title, fontWeight: '600', color: color.ink },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tagName: { fontSize: font.size.caption, fontWeight: '600' },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: font.size.body, fontWeight: '600', color: '#7C8186', fontVariant: ['tabular-nums'] },
});
