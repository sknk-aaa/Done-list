import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useAppStore } from '@/state/store';
import { color, font } from '@/theme/tokens';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, toast.action ? 4200 : 1900);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + 90 }]}
    >
      <View style={styles.toast}>
        <Text style={styles.text}>{toast.msg}</Text>
        {toast.action && (
          <Pressable
            hitSlop={8}
            onPress={() => {
              toast.action?.run();
              clearToast();
            }}
          >
            <Text style={styles.action}>{toast.action.label}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(28,30,34,0.94)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  text: { color: '#fff', fontSize: font.size.body, fontWeight: '600' },
  action: { color: color.teal, fontSize: font.size.body, fontWeight: '700' },
});
