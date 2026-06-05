import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useAppStore } from '@/state/store';
import { font } from '@/theme/tokens';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, 1900);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      pointerEvents="none"
      style={[styles.toast, { bottom: insets.bottom + 90 }]}
    >
      <Text style={styles.text}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(28,30,34,0.92)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  text: { color: '#fff', fontSize: font.size.body, fontWeight: '600' },
});
