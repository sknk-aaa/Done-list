import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTags } from '@/data/useData';
import { createTag, deleteTag } from '@/db/queries';
import { ChevronLeft } from '@/icons';
import { useAppStore } from '@/state/store';
import { font, presetColors, radius, shadow } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

export function TagEditScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { t } = useTranslation();
  const open = useAppStore((s) => s.tagEditOpen);
  const setOpen = useAppStore((s) => s.setTagEditOpen);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tags = useTags();

  const [mounted, setMounted] = useState(open);
  const tx = useSharedValue(1);
  const dragX = useSharedValue(0);
  const [name, setName] = useState('');
  const [swatch, setSwatch] = useState(presetColors[0]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setName('');
      setSwatch(presetColors[0]);
      dragX.value = 0;
      tx.value = withTiming(0, { duration: 300, easing: EASE });
    } else {
      tx.value = withTiming(1, { duration: 240, easing: EASE }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
  }, [open, tx, dragX]);

  // Swipe right to close.
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

  const onAdd = async () => {
    if (!name.trim()) return;
    await createTag(name.trim(), swatch);
    setName('');
  };

  const confirmDelete = (id: number) => {
    Alert.alert(t('tagEdit.deleteTitle'), t('tagEdit.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void deleteTag(id) },
    ]);
  };

  if (!mounted) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, { paddingTop: insets.top }, slideStyle]}>
        <View style={styles.bar}>
          <Pressable style={styles.back} onPress={() => setOpen(false)} hitSlop={8}>
            <ChevronLeft size={22} color={c.teal} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('tagEdit.title')}</Text>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.sectionLabel}>{t('tagEdit.listTitle')}</Text>
          <View style={styles.card}>
            {tags.map((tg, i) => (
              <View key={tg.id} style={[styles.tagRow, i > 0 && styles.divider]}>
                <View style={styles.left}>
                  <View style={[styles.dot, { backgroundColor: tg.color }]} />
                  <Text style={styles.tagName}>{tg.name}</Text>
                </View>
                <Pressable onPress={() => confirmDelete(tg.id)} hitSlop={8}>
                  <Text style={styles.delete}>{t('common.delete')}</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{t('tagEdit.newTitle')}</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder={t('tagEdit.namePlaceholder')}
              placeholderTextColor={c.muted}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
            <View style={styles.swatchRow}>
              {presetColors.map((c) => (
                <Pressable key={c} onPress={() => setSwatch(c)} style={[styles.swatchWrap, swatch === c && styles.swatchSelected]}>
                  <View style={[styles.swatch, { backgroundColor: c }]} />
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
              onPress={onAdd}
              disabled={!name.trim()}
            >
              <Text style={styles.addText}>{t('tagEdit.addButton')}</Text>
            </Pressable>
          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </Animated.View>
    </GestureDetector>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
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
  sectionLabel: { fontSize: font.size.small, fontWeight: '600', color: c.muted, marginTop: 8, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: c.bg, borderRadius: radius.card, ...shadow.card },
  tagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 13, height: 13, borderRadius: 7 },
  tagName: { fontSize: font.size.title, color: c.ink },
  delete: { fontSize: font.size.body, fontWeight: '600', color: c.red },
  input: {
    backgroundColor: c.field,
    borderRadius: radius.field,
    margin: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: font.size.title,
    color: c.ink,
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  swatchWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: c.teal },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  addBtn: { backgroundColor: c.teal, borderRadius: radius.field, margin: 16, marginTop: 8, paddingVertical: 15, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addText: { fontSize: font.size.title, fontWeight: '700', color: c.onAccent },
});
