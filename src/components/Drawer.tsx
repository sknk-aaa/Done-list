import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Chat, Check, ChevronRight, Compass, PlayCircle, ProSpark, Question, Star } from '@/icons';
import { useAppStore, type SwipeAction } from '@/state/store';
import { color, font, radius, shadow } from '@/theme/tokens';

import { Segmented } from './Segmented';
import { Switch } from './Switch';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

export function Drawer() {
  const { t } = useTranslation();
  const open = useAppStore((s) => s.drawerOpen);
  const setOpen = useAppStore((s) => s.setDrawerOpen);
  const showTime = useAppStore((s) => s.showTime);
  const setShowTime = useAppStore((s) => s.setShowTime);
  const swipeAction = useAppStore((s) => s.swipeAction);
  const setSwipeAction = useAppStore((s) => s.setSwipeAction);
  const setOnboardingOpen = useAppStore((s) => s.setOnboardingOpen);
  const showToast = useAppStore((s) => s.showToast);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelW = width * 0.84;

  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 300, easing: EASE });
    } else {
      progress.value = withTiming(0, { duration: 240, easing: EASE }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
  }, [open, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - progress.value) * panelW }] }));

  const close = () => setOpen(false);
  const soon = () => {
    close();
    showToast(t('toast.comingSoon'));
  };

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.fill}>
        <AnimatedPressable style={[styles.scrim, scrimStyle]} onPress={close} />
        <Animated.View style={[styles.panel, { width: panelW, paddingTop: insets.top }, shadow.popover, panelStyle]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.appHeader}>
              <View style={styles.appIcon}>
                <Check size={22} color="#fff" strokeWidth={3} />
              </View>
              <Text style={styles.appName}>{t('app.name')}</Text>
              <Text style={styles.plan}>{t('drawer.planFree')}</Text>
            </View>

            <Pressable style={[styles.card, styles.proRow]} onPress={soon}>
              <ProSpark size={22} color={color.teal} />
              <View style={styles.proText}>
                <Text style={styles.proTitle}>{t('drawer.upgrade')}</Text>
                <Text style={styles.proSub}>{t('drawer.upgradeSub')}</Text>
              </View>
              <ChevronRight size={20} color={color.chevron} />
            </Pressable>

            <Text style={styles.sectionLabel}>{t('drawer.settings')}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <Text style={styles.rowTitle}>{t('drawer.showTime')}</Text>
                <Switch value={showTime} onValueChange={setShowTime} />
              </View>
              <View style={[styles.swipeBlock, styles.divider]}>
                <Text style={styles.swipeLabel}>{t('drawer.swipeLabel')}</Text>
                <Segmented<SwipeAction>
                  segments={[
                    { value: 'date', label: t('drawer.swipeDate') },
                    { value: 'tab', label: t('drawer.swipeTab') },
                  ]}
                  value={swipeAction}
                  onChange={setSwipeAction}
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>{t('drawer.support')}</Text>
            <View style={styles.card}>
              <SupportRow icon={<Compass />} label={t('drawer.howto')} onPress={soon} first />
              <SupportRow icon={<Question />} label={t('drawer.faq')} onPress={soon} />
              <SupportRow icon={<Chat />} label={t('drawer.report')} onPress={soon} />
              <SupportRow icon={<Star />} label={t('drawer.review')} onPress={soon} />
              <SupportRow
                icon={<PlayCircle />}
                label={t('drawer.replayOnboarding')}
                onPress={() => {
                  close();
                  setOnboardingOpen(true);
                }}
              />
            </View>

            <Text style={styles.footer}>
              {t('app.name')} v1.0.0
            </Text>
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SupportRow({ icon, label, onPress, first }: { icon: ReactNode; label: string; onPress: () => void; first?: boolean }) {
  return (
    <Pressable style={[styles.supportRow, !first && styles.divider]} onPress={onPress}>
      {icon}
      <Text style={styles.supportLabel}>{label}</Text>
      <ChevronRight size={20} color={color.chevron} />
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  fill: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,28,0.38)' },
  panel: { backgroundColor: '#F5F6F7' },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  appHeader: { paddingTop: 48, paddingBottom: 14, alignItems: 'flex-start' },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: color.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: font.size.h1, fontWeight: '700', color: color.ink },
  plan: { fontSize: font.size.caption, color: color.muted, marginTop: 2 },

  card: { backgroundColor: color.bg, borderRadius: radius.card, ...shadow.card, marginBottom: 6 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },

  proRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  proText: { flex: 1 },
  proTitle: { fontSize: font.size.title, fontWeight: '600', color: color.teal },
  proSub: { fontSize: font.size.caption, color: color.muted, marginTop: 2 },

  sectionLabel: { fontSize: font.size.small, fontWeight: '600', color: color.muted, paddingTop: 20, paddingBottom: 8, paddingLeft: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowTitle: { fontSize: font.size.title, color: color.ink },
  swipeBlock: { paddingVertical: 14, paddingHorizontal: 16 },
  swipeLabel: { fontSize: font.size.caption, color: color.muted, marginBottom: 10 },

  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 16 },
  supportLabel: { flex: 1, fontSize: font.size.title, fontWeight: '500', color: color.ink },

  footer: { textAlign: 'center', fontSize: font.size.caption, color: '#BCC1C6', marginTop: 26 },
});
