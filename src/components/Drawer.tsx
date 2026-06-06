import { type ReactNode, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Chat, ChevronRight, Compass, ProSpark, Question, Star } from '@/icons';
import { purchasePro, purchasesAvailable, restorePro } from '@/lib/purchases';
import { useAppStore, type SwipeAction } from '@/state/store';
import { font, radius, shadow } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

import { Segmented } from './Segmented';
import { Switch } from './Switch';

const APP_ICON = require('../../assets/images/icon-sm.png');
const EASE = Easing.bezier(0.4, 0, 0.2, 1);
const SITE = 'https://sknk-aaa.github.io/Done-list';
const FAQ_URL = `${SITE}/faq.html`;
const CONTACT_FORM = { en: 'https://tally.so/r/81rG5Y', ja: 'https://tally.so/r/obzogX' };

export function Drawer() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { t, i18n } = useTranslation();
  const open = useAppStore((s) => s.drawerOpen);
  const setOpen = useAppStore((s) => s.setDrawerOpen);
  const showTime = useAppStore((s) => s.showTime);
  const setShowTime = useAppStore((s) => s.setShowTime);
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const isPro = useAppStore((s) => s.isPro);
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
  const upgrade = async () => {
    if (!purchasesAvailable()) {
      showToast(t('toast.comingSoon'));
      return;
    }
    try {
      if (await purchasePro()) showToast(t('toast.proUnlocked'));
    } catch {
      showToast(t('toast.purchaseFailed'));
    }
  };
  const restore = async () => {
    if (!purchasesAvailable()) {
      showToast(t('toast.comingSoon'));
      return;
    }
    showToast((await restorePro()) ? t('toast.proUnlocked') : t('toast.restoredNone'));
  };

  if (!mounted) return null;

  return (
    <View style={styles.fill}>
      <AnimatedPressable style={[styles.scrim, scrimStyle]} onPress={close} />
        <Animated.View style={[styles.panel, { width: panelW, paddingTop: insets.top }, shadow.popover, panelStyle]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.appHeader}>
              <Image source={APP_ICON} style={styles.appIcon} />
              <View style={styles.appHeaderText}>
                <Text style={styles.appName}>{t('app.name')}</Text>
                <View style={[styles.planPill, isPro && styles.planPillPro]}>
                  <Text style={[styles.planPillText, isPro && styles.planPillTextPro]}>
                    {isPro ? t('drawer.planPro') : t('drawer.planFree')}
                  </Text>
                </View>
              </View>
            </View>

            {!isPro && (
              <Pressable style={[styles.card, styles.proRow]} onPress={() => void upgrade()}>
                <ProSpark size={22} color={c.teal} />
                <View style={styles.proText}>
                  <Text style={styles.proTitle}>{t('drawer.upgrade')}</Text>
                  <Text style={styles.proSub}>{t('drawer.upgradeSub')}</Text>
                </View>
                <ChevronRight size={20} color={c.chevron} />
              </Pressable>
            )}

            <Text style={styles.sectionLabel}>{t('drawer.settings')}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <Text style={styles.rowTitle}>{t('drawer.showTime')}</Text>
                <Switch value={showTime} onValueChange={setShowTime} />
              </View>
              {isPro ? (
                <View style={[styles.settingRow, styles.divider]}>
                  <Text style={styles.rowTitle}>{t('drawer.darkTheme')}</Text>
                  <Switch value={darkMode} onValueChange={setDarkMode} />
                </View>
              ) : (
                <Pressable style={[styles.settingRow, styles.divider]} onPress={() => void upgrade()}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={styles.rowTitle}>{t('drawer.darkTheme')}</Text>
                    <Text style={styles.proTag}>{t('drawer.planPro')}</Text>
                  </View>
                  <ChevronRight size={20} color={c.chevron} />
                </Pressable>
              )}
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
              <SupportRow
                icon={<Compass />}
                label={t('drawer.howto')}
                onPress={() => {
                  close();
                  setOnboardingOpen(true);
                }}
                first
              />
              <SupportRow
          icon={<Question />}
          label={t('drawer.faq')}
          onPress={() => {
            close();
            void Linking.openURL(FAQ_URL);
          }}
        />
              <SupportRow
          icon={<Chat />}
          label={t('drawer.report')}
          onPress={() => {
            close();
            void Linking.openURL(i18n.language === 'ja' ? CONTACT_FORM.ja : CONTACT_FORM.en);
          }}
        />
              <SupportRow icon={<Star />} label={t('drawer.review')} onPress={soon} />
            </View>

            {!isPro && (
              <Pressable onPress={() => void restore()} hitSlop={8} style={styles.restoreBtn}>
                <Text style={styles.restoreText}>{t('drawer.restore')}</Text>
              </Pressable>
            )}

            <Text style={styles.footer}>
              {t('app.name')} v1.0.0
            </Text>
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </Animated.View>
    </View>
  );
}

function SupportRow({ icon, label, onPress, first }: { icon: ReactNode; label: string; onPress: () => void; first?: boolean }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable style={[styles.supportRow, !first && styles.divider]} onPress={onPress}>
      {icon}
      <Text style={styles.supportLabel}>{label}</Text>
      <ChevronRight size={20} color={c.chevron} />
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const makeStyles = (c: Colors) => StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,28,0.38)' },
  panel: { backgroundColor: c.bgSoft },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  appHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 46, paddingBottom: 18 },
  appIcon: { width: 56, height: 56, borderRadius: 15, ...shadow.card },
  appHeaderText: { flex: 1 },
  appName: { fontSize: 22, fontWeight: '800', color: c.ink, letterSpacing: 0.2 },
  planPill: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.divider,
  },
  planPillPro: { backgroundColor: c.tealTint, borderColor: 'transparent' },
  planPillText: { fontSize: 11, fontWeight: '700', color: c.muted, letterSpacing: 0.3 },
  planPillTextPro: { color: c.teal },

  card: { backgroundColor: c.bg, borderRadius: radius.card, ...shadow.card, marginBottom: 6 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },

  proRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  proText: { flex: 1 },
  proTitle: { fontSize: font.size.title, fontWeight: '600', color: c.teal },
  proSub: { fontSize: font.size.caption, color: c.muted, marginTop: 2 },

  sectionLabel: { fontSize: font.size.small, fontWeight: '600', color: c.muted, paddingTop: 20, paddingBottom: 8, paddingLeft: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowTitle: { fontSize: font.size.title, color: c.ink },
  rowTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proTag: {
    fontSize: 11,
    fontWeight: '700',
    color: c.teal,
    borderWidth: 1,
    borderColor: c.teal,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  swipeBlock: { paddingVertical: 14, paddingHorizontal: 16 },
  swipeLabel: { fontSize: font.size.caption, color: c.muted, marginBottom: 10 },

  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 16 },
  supportLabel: { flex: 1, fontSize: font.size.title, fontWeight: '500', color: c.ink },

  restoreBtn: { alignSelf: 'center', paddingVertical: 8, marginTop: 18 },
  restoreText: { fontSize: font.size.caption, color: c.muted, textDecorationLine: 'underline' },
  footer: { textAlign: 'center', fontSize: font.size.caption, color: c.faint, marginTop: 14 },
});
