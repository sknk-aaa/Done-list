import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { font, shadow } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

export type Segment<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function Segmented<T extends string>({ segments, value, onChange }: Props<T>) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.track}>
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            style={styles.seg}
            onPress={() => {
              if (s.value !== value) haptics.selection();
              onChange(s.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.pill, active && [styles.pillActive, shadow.card]]}>
              <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{s.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: c.segTrack, borderRadius: 9, padding: 3 },
  seg: { flex: 1 },
  pill: { paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  pillActive: { backgroundColor: c.segActive },
  label: { fontSize: font.size.body, fontWeight: '600' },
  labelActive: { color: '#2C2E33' },
  labelInactive: { color: c.muted },
});
