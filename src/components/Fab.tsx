import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Plus } from '@/icons';
import { shadow, size } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

export function Fab({ onPress }: { onPress: () => void }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, shadow.fab, pressed && styles.pressed]}
    >
      <Plus size={size.fabIcon} color={c.onAccent} strokeWidth={2.6} />
    </Pressable>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: size.fab,
    height: size.fab,
    borderRadius: size.fab / 2,
    backgroundColor: c.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: c.tealDark },
});
