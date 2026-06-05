import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, font, shadow } from '@/theme/tokens';

export type Segment<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function Segmented<T extends string>({ segments, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable key={s.value} style={styles.seg} onPress={() => onChange(s.value)}>
            <View style={[styles.pill, active && [styles.pillActive, shadow.card]]}>
              <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{s.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: color.segTrack, borderRadius: 9, padding: 3 },
  seg: { flex: 1 },
  pill: { paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  pillActive: { backgroundColor: color.white },
  label: { fontSize: font.size.body, fontWeight: '600' },
  labelActive: { color: color.teal },
  labelInactive: { color: '#8A8F94' },
});
