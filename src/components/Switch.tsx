import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { size } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

const { w, h, knob, pad } = size.switch;

export function Switch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const p = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: 200 }), [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? c.teal : c.switchOff,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * (w - knob - pad * 2) }],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={6}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, { backgroundColor: value ? c.onAccent : '#fff' }, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  track: { width: w, height: h, borderRadius: h / 2, padding: pad, justifyContent: 'center' },
  knob: {
    width: knob,
    height: knob,
    borderRadius: knob / 2,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
