import { Pressable, StyleSheet } from 'react-native';

import { Plus } from '@/icons';
import { color, shadow, size } from '@/theme/tokens';

export function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, shadow.fab, pressed && styles.pressed]}
    >
      <Plus size={size.fabIcon} color={color.white} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: size.fab,
    height: size.fab,
    borderRadius: size.fab / 2,
    backgroundColor: color.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: color.tealDark },
});
