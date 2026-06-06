import { type ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { color, radius, shadow } from '@/theme/tokens';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);
const DISMISS_DISTANCE = 70;
const DISMISS_VELOCITY = 500;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  const { height: screenH } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const sheetH = useSharedValue(screenH);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      dragY.value = 0;
      progress.value = withTiming(1, { duration: 320, easing: EASE });
    } else {
      progress.value = withTiming(0, { duration: 240, easing: EASE }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, progress, dragY]);

  // Drag the whole sheet down to dismiss (activates only on a downward drag,
  // so taps and text inputs keep working).
  const dragGesture = Gesture.Pan()
    .activeOffsetY([4, 1000])
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (dragY.value > DISMISS_DISTANCE || (e.velocityY > DISMISS_VELOCITY && dragY.value > 0)) {
        runOnJS(onClose)();
      } else {
        dragY.value = withTiming(0, { duration: 180 });
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetH.value + dragY.value }],
  }));

  if (!mounted) return null;

  return (
    <View style={styles.fill}>
      <AnimatedPressable style={[styles.scrim, scrimStyle]} onPress={onClose} />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GestureDetector gesture={dragGesture}>
          <Animated.View
            style={[styles.sheet, shadow.sheet, sheetStyle]}
            onLayout={(e) => {
              sheetH.value = e.nativeEvent.layout.height;
            }}
          >
            <View style={styles.grabZone}>
              <View style={styles.grab} />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,28,0.38)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  grabZone: { paddingTop: 8, paddingBottom: 6, alignItems: 'center' },
  grab: { width: 38, height: 5, borderRadius: 3, backgroundColor: '#E2E5E8' },
});
