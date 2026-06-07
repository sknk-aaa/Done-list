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

export function CheckRing({ done, color, onToggle }: Props) {
  const scale = useSharedValue(1);

  const onPress = () => {
    if (!done) {
      haptics.medium();
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
      <Animated.View style={[styles.ring, { borderColor: color }, aStyle]}>
        {done && (
          <Animated.View entering={ZoomIn.duration(140).reduceMotion(ReduceMotion.System)}>
            <Check size={size.statusCheck} color={color} strokeWidth={3.4} />
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
