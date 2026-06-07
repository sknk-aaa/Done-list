import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Check } from '@/icons';
import { haptics } from '@/lib/haptics';
import { size } from '@/theme/tokens';

type Props = {
  done: boolean;
  color: string;
  onToggle: () => void;
};

// Pick a check color that stays legible on the (filled) ring: dark on light tags, white on dark.
const onColor = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.62 ? '#1C1F24' : '#FFFFFF';
};

export function CheckRing({ done, color, onToggle }: Props) {
  const scale = useSharedValue(1);

  const onPress = () => {
    if (!done) {
      haptics.success();
      scale.value = withSequence(
        withTiming(1.18, { duration: 110, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 9, stiffness: 220, reduceMotion: ReduceMotion.System }),
      );
    } else {
      haptics.selection();
    }
    onToggle();
  };

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={styles.hit}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={done ? '完了を取り消す' : '完了にする'}
    >
      <Animated.View style={[styles.ring, { borderColor: color, backgroundColor: done ? color : 'transparent' }, aStyle]}>
        {done && (
          <Animated.View entering={ZoomIn.duration(140).reduceMotion(ReduceMotion.System)}>
            <Check size={size.statusCheck} color={onColor(color)} strokeWidth={3.4} />
          </Animated.View>
        )}
      </Animated.View>
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
