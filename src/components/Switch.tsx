import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { color, size } from '@/theme/tokens';

const { w, h, knob, pad } = size.switch;

export function Switch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const p = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: 200 }), [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? color.teal : color.switchOff,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * (w - knob - pad * 2) }],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={6}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: w, height: h, borderRadius: h / 2, padding: pad, justifyContent: 'center' },
  knob: {
    width: knob,
    height: knob,
    borderRadius: knob / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
