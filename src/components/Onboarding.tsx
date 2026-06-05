import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ONB } from '@/data/onboarding';
import { Bell, Check } from '@/icons';
import { useAppStore } from '@/state/store';
import { color, font, radius, shadow } from '@/theme/tokens';

export const ONBOARDED_KEY = 'todone_onboarded';

const PREVIEWS = [DailyPreview, MonthPreview, TimePreview];

export function Onboarding() {
  const open = useAppStore((s) => s.onboardingOpen);
  const appLang = useAppStore((s) => s.locale);
  const setOpen = useAppStore((s) => s.setOnboardingOpen);
  const insets = useSafeAreaInsets();

  const [lang, setLang] = useState<'ja' | 'en'>(appLang === 'en' ? 'en' : 'ja');
  const [index, setIndex] = useState(0);
  const width = Dimensions.get('window').width;
  const [scroller, setScroller] = useState<ScrollView | null>(null);

  if (!open) return null;

  const finish = () => {
    void AsyncStorage.setItem(ONBOARDED_KEY, '1');
    setOpen(false);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (index >= ONB.length - 1) finish();
    else scroller?.scrollTo({ x: width * (index + 1), animated: true });
  };

  const tx = (ja: string, en: string) => (lang === 'ja' ? ja : en);

  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable style={styles.langPill} onPress={() => setLang((l) => (l === 'ja' ? 'en' : 'ja'))}>
          <Text style={styles.langText}>{lang === 'ja' ? 'English' : '日本語'}</Text>
        </Pressable>

        <ScrollView
          ref={setScroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          style={styles.pager}
        >
          {ONB.map((slide, i) => {
            const Preview = PREVIEWS[i];
            const [heading, body] = slide[lang];
            return (
              <View key={i} style={[styles.slide, { width }]}>
                <View style={styles.previewArea}>
                  <Preview lang={lang} />
                </View>
                <Text style={styles.heading}>{heading}</Text>
                <Text style={styles.body}>{body}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.dots}>
            {ONB.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <Pressable style={styles.primary} onPress={next}>
            <Text style={styles.primaryText}>
              {index >= ONB.length - 1 ? tx('始める', 'Get Started') : tx('次へ', 'Next')}
            </Text>
          </Pressable>
          <Pressable onPress={finish} style={styles.skip}>
            <Text style={styles.skipText}>{tx('スキップ', 'Skip')}</Text>
          </Pressable>
        </View>
    </Animated.View>
  );
}

// ── mini-mock previews ──────────────────────────────────────
function PreviewCard({ children }: { children: React.ReactNode }) {
  return <View style={[styles.card, shadow.card]}>{children}</View>;
}

function MiniRow({ done, title, tag, tagColor }: { done: boolean; title: string; tag: string; tagColor: string }) {
  return (
    <View style={styles.miniRow}>
      <View style={[styles.miniRing, { borderColor: tagColor }]}>{done && <Check size={11} color={tagColor} strokeWidth={3.2} />}</View>
      <View style={styles.miniMain}>
        <Text style={styles.miniTitle}>{title}</Text>
        <View style={styles.miniTagRow}>
          <View style={[styles.miniDot, { backgroundColor: tagColor }]} />
          <Text style={[styles.miniTag, { color: tagColor }]}>{tag}</Text>
        </View>
      </View>
    </View>
  );
}

function DailyPreview({ lang }: { lang: 'ja' | 'en' }) {
  return (
    <PreviewCard>
      <Text style={styles.miniDate}>{lang === 'ja' ? '6月19日（金）' : 'Jun 19 (Fri)'}</Text>
      <MiniRow done title={lang === 'ja' ? 'ブログ更新' : 'Update blog'} tag={lang === 'ja' ? '仕事' : 'Work'} tagColor={color.blue} />
      <MiniRow done title={lang === 'ja' ? 'ジムで筋トレ' : 'Gym workout'} tag={lang === 'ja' ? '健康' : 'Health'} tagColor={color.green} />
      <MiniRow done={false} title={lang === 'ja' ? '買い出し' : 'Groceries'} tag={lang === 'ja' ? '買い物' : 'Shopping'} tagColor={color.orange} />
    </PreviewCard>
  );
}

function MonthPreview({ lang }: { lang: 'ja' | 'en' }) {
  const palette = [color.blue, color.green, color.orange, color.purple, color.pink, color.gold];
  return (
    <PreviewCard>
      <Text style={styles.miniDate}>{lang === 'ja' ? '2026 / 6月' : 'Jun 2026'}</Text>
      <View style={styles.miniGrid}>
        {Array.from({ length: 35 }, (_, i) => (
          <View key={i} style={styles.miniCell}>
            <Text style={styles.miniCellNum}>{((i + 1) % 30) + 1}</Text>
            {i % 3 !== 2 && <View style={[styles.miniBand, { backgroundColor: palette[i % palette.length] }]} />}
            {i % 4 === 0 && <View style={[styles.miniBand, { backgroundColor: palette[(i + 2) % palette.length] }]} />}
          </View>
        ))}
      </View>
    </PreviewCard>
  );
}

function TimePreview({ lang }: { lang: 'ja' | 'en' }) {
  return (
    <View style={styles.timeWrap}>
      <PreviewCard>
        <View style={styles.miniRowTime}>
          <View style={[styles.miniRing, { borderColor: color.purple }]} />
          <View style={styles.miniMain}>
            <Text style={styles.miniTitle}>{lang === 'ja' ? '読書（20分）' : 'Read (20 min)'}</Text>
            <View style={styles.miniTagRow}>
              <View style={[styles.miniDot, { backgroundColor: color.purple }]} />
              <Text style={[styles.miniTag, { color: color.purple }]}>{lang === 'ja' ? '自己投資' : 'Growth'}</Text>
            </View>
          </View>
          <View style={styles.miniTimeRow}>
            <Bell size={11} color={color.teal} />
            <Text style={styles.miniTime}>22:00</Text>
          </View>
        </View>
      </PreviewCard>
      <View style={[styles.banner, shadow.card]}>
        <Bell size={16} color={color.teal} />
        <Text style={styles.bannerText}>{lang === 'ja' ? '読書（20分） の時間です' : 'Time for: Read (20 min)'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.bg },
  langPill: {
    position: 'absolute',
    right: 20,
    top: 12,
    zIndex: 2,
    backgroundColor: color.bgSoft,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  langText: { fontSize: font.size.caption, fontWeight: '600', color: color.muted },
  pager: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  previewArea: { height: 320, justifyContent: 'center', marginBottom: 28 },
  heading: { fontSize: font.size.h1, fontWeight: '700', color: color.ink, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: font.size.bodyL, color: color.muted, textAlign: 'center', lineHeight: 22, maxWidth: 285 },

  footer: { paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D7DBDF' },
  dotActive: { width: 22, backgroundColor: color.teal },
  primary: { alignSelf: 'stretch', backgroundColor: color.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: font.size.title, fontWeight: '700' },
  skip: { paddingVertical: 6 },
  skipText: { fontSize: font.size.body, color: color.muted },

  // previews
  card: { width: 250, backgroundColor: color.bg, borderRadius: radius.cardL, padding: 16 },
  miniDate: { fontSize: font.size.caption, fontWeight: '700', color: color.ink, marginBottom: 12 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  miniRowTime: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniRing: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  miniMain: { flex: 1, gap: 3 },
  miniTitle: { fontSize: font.size.caption, fontWeight: '600', color: color.ink },
  miniTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniDot: { width: 5, height: 5, borderRadius: 3 },
  miniTag: { fontSize: 10, fontWeight: '600' },
  miniTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniTime: { fontSize: 11, fontWeight: '600', color: '#7C8186' },

  miniGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  miniCell: { width: `${100 / 7}%`, height: 34, paddingHorizontal: 2, paddingTop: 2 },
  miniCellNum: { fontSize: 7, color: color.muted },
  miniBand: { height: 5, borderRadius: 2, marginTop: 2 },

  timeWrap: { alignItems: 'center', gap: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: 250,
  },
  bannerText: { fontSize: font.size.caption, color: color.ink, flex: 1 },
});
