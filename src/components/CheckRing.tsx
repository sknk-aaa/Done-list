import { Pressable, StyleSheet, View } from 'react-native';

import { Check } from '@/icons';
import { size } from '@/theme/tokens';

type Props = {
  done: boolean;
  color: string;
  onToggle: () => void;
};

export function CheckRing({ done, color, onToggle }: Props) {
  return (
    <Pressable onPress={onToggle} hitSlop={12} style={styles.hit}>
      <View style={[styles.ring, { borderColor: color }]}>
        {done && <Check size={size.statusCheck} color={color} strokeWidth={3.4} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { paddingVertical: 2, paddingRight: 2 },
  ring: {
    width: size.statusCircle,
    height: size.statusCircle,
    borderRadius: size.statusCircle / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
