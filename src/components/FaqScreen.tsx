import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { FAQ } from '@/data/faq';
import { ChevronDown, ChevronLeft } from '@/icons';
import { useAppStore } from '@/state/store';
import { useColors, type Colors } from '@/theme/theme';
import { font, radius, shadow } from '@/theme/tokens';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

export function FaqScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const open = useAppStore((s) => s.faqOpen);
  const setOpen = useAppStore((s) => s.setFaqOpen);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState<number | null>(null);
  const tx = useSharedValue(1);
  const dragX = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setExpanded(null);
      dragX.value = 0;
      tx.value = withTiming(0, { duration: 300, easing: EASE });
    } else {
      tx.value = withTiming(1, { duration: 240, easing: EASE }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
  }, [open, tx, dragX]);

  const pan = Gesture.Pan()
    .activeOffsetX([12, 1000])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      dragX.value = Math.max(0, e.translationX);
    })
    .onEnd((e) => {
      if (dragX.value > width * 0.3 || (e.velocityX > 600 && dragX.value > 0)) {
        runOnJS(setOpen)(false);
      } else {
        dragX.value = withTiming(0, { duration: 180 });
      }
    });

  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value * width + dragX.value }] }));

  if (!mounted) return null;

  const items = FAQ[lang];

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, { paddingTop: insets.top }, slideStyle]}>
        <View style={styles.bar}>
          <Pressable style={styles.back} onPress={() => setOpen(false)} hitSlop={8}>
            <ChevronLeft size={22} color={c.teal} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('drawer.faq')}</Text>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {items.map((it, i) => {
              const isOpen = expanded === i;
              return (
                <View key={i} style={i > 0 && styles.divider}>
                  <Pressable style={styles.qRow} onPress={() => setExpanded(isOpen ? null : i)}>
                    <Text style={styles.qBadge}>Q</Text>
                    <Text style={styles.q}>{it.q}</Text>
                    <View style={isOpen ? styles.caretOpen : undefined}>
                      <ChevronDown size={18} color={c.muted} />
                    </View>
                  </Pressable>
                  {isOpen && (
                    <View style={styles.aRow}>
                      <Text style={styles.aBadge}>A</Text>
                      <Text style={styles.a}>{it.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </Animated.View>
    </GestureDetector>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.bgSoft },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: c.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line,
    },
    back: { flexDirection: 'row', alignItems: 'center', minWidth: 72 },
    backText: { fontSize: font.size.title, color: c.teal },
    title: { fontSize: font.size.title, fontWeight: '700', color: c.ink },
    body: { padding: 18 },
    card: { backgroundColor: c.bg, borderRadius: radius.card, ...shadow.card, paddingHorizontal: 16 },
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },
    qRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 15 },
    qBadge: {
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: c.teal,
      color: c.white,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 22,
      overflow: 'hidden',
    },
    q: { flex: 1, fontSize: font.size.title, fontWeight: '600', color: c.ink },
    caretOpen: { transform: [{ rotate: '180deg' }] },
    aRow: { flexDirection: 'row', gap: 10, paddingBottom: 16, paddingTop: 2 },
    aBadge: {
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: c.field,
      color: c.muted,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 22,
      overflow: 'hidden',
    },
    a: { flex: 1, fontSize: font.size.body, color: c.muted, lineHeight: 21, paddingTop: 1 },
  });
