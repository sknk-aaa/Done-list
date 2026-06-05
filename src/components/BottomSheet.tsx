import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { color, radius, shadow } from '@/theme/tokens';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

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

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 320, easing: EASE });
    } else {
      progress.value = withTiming(0, { duration: 240, easing: EASE }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetH.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <AnimatedPressable style={[styles.scrim, scrimStyle]} onPress={onClose} />
        <Animated.View
          style={[styles.sheet, shadow.sheet, sheetStyle]}
          onLayout={(e) => {
            sheetH.value = e.nativeEvent.layout.height;
          }}
        >
          <View style={styles.grab} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,28,0.38)' },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  grab: {
    alignSelf: 'center',
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E5E8',
    marginTop: 8,
  },
});

