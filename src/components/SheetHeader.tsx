import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, font } from '@/theme/tokens';

type Action = { label: string; onPress: () => void; muted?: boolean; disabled?: boolean };

export function SheetHeader({ left, title, right }: { left: Action; title: string; right: Action }) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <Pressable onPress={left.onPress} hitSlop={8}>
          <Text style={[styles.action, left.muted ? styles.muted : styles.accent]}>{left.label}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.right]}>
        <Pressable onPress={right.onPress} hitSlop={8} disabled={right.disabled}>
          <Text style={[styles.action, styles.accent, right.disabled && styles.disabled]}>{right.label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 14,
  },
  side: { flex: 1, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  title: { fontSize: font.size.title, fontWeight: '700', color: color.ink },
  action: { fontSize: font.size.title },
  accent: { color: color.teal, fontWeight: '600' },
  muted: { color: color.muted },
  disabled: { opacity: 0.4 },
});
