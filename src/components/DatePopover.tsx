import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ChevronLeft, ChevronRight } from '@/icons';
import {
  MONTHS_EN,
  WEEKDAYS_EN,
  WEEKDAYS_JA,
  daysInMonth,
  firstWeekday,
  getTodayISO,
  parseISO,
  toISO,
} from '@/lib/date';
import { HeaderCaret } from '@/components/AppHeader';
import { useAppStore } from '@/state/store';
import { color, font, radius, shadow } from '@/theme/tokens';

export function DatePopover() {
  const { t, i18n } = useTranslation();
  void t;
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const open = useAppStore((s) => s.datePopOpen);
  const ctx = useAppStore((s) => s.datePopContext);
  const close = useAppStore((s) => s.closeDatePop);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const viewYear = useAppStore((s) => s.viewYear);
  const viewMonth = useAppStore((s) => s.viewMonth);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewMonth = useAppStore((s) => s.setViewMonth);
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'day' | 'month'>('day');
  const [y, setY] = useState(viewYear);
  const [m, setM] = useState(viewMonth);

  useEffect(() => {
    if (!open) return;
    if (ctx === 'month') {
      setMode('month');
      setY(viewYear);
      setM(viewMonth);
    } else {
      setMode('day');
      const p = parseISO(selectedDate);
      setY(p.y);
      setM(p.m0);
    }
  }, [open, ctx, selectedDate, viewYear, viewMonth]);

  if (!open) return null;

  const todayISO = getTodayISO();
  const weekdays = lang === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN;

  const headTitle =
    mode === 'month'
      ? lang === 'ja'
        ? `${y}年`
        : `${y}`
      : lang === 'ja'
        ? `${y}年${m + 1}月`
        : `${MONTHS_EN[m]} ${y}`;

  const onNav = (dir: number) => {
    if (mode === 'month') {
      setY((v) => v + dir);
    } else {
      const total = y * 12 + m + dir;
      setY(Math.floor(total / 12));
      setM(((total % 12) + 12) % 12);
    }
  };

  const pickDay = (d: number) => {
    setSelectedDate(toISO(y, m, d));
    close();
    if (ctx === 'month') useAppStore.getState().setView('daily');
  };

  const pickMonth = (mo: number) => {
    if (ctx === 'month') {
      setViewMonth(y, mo);
      close();
    } else {
      setM(mo);
      setMode('day');
    }
  };

  // day grid cells
  const first = firstWeekday(y, m);
  const dim = daysInMonth(y, m);
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <View style={styles.fill}>
      <Pressable style={styles.scrim} onPress={close} />
      <Animated.View entering={FadeIn.duration(120)} style={[styles.card, { top: insets.top + 44 }, shadow.popover]}>
        <View style={styles.head}>
          <Pressable onPress={() => onNav(-1)} hitSlop={8} style={styles.nav}>
            <ChevronLeft size={16} color="#9AA0A6" />
          </Pressable>
          <Pressable style={styles.titleBtn} onPress={() => setMode(mode === 'day' ? 'month' : 'day')}>
            <Text style={styles.title}>{headTitle}</Text>
            <HeaderCaret />
          </Pressable>
          <Pressable onPress={() => onNav(1)} hitSlop={8} style={styles.nav}>
            <ChevronRight size={16} color="#9AA0A6" />
          </Pressable>
        </View>

        {mode === 'day' ? (
          <>
            <View style={styles.row}>
              {weekdays.map((w, i) => (
                <Text key={i} style={[styles.dow, i === 0 && styles.sun]}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((d, i) => {
                if (d == null) return <View key={i} style={styles.dcell} />;
                const iso = toISO(y, m, d);
                const sel = iso === selectedDate;
                const today = iso === todayISO;
                return (
                  <Pressable key={i} style={styles.dcell} onPress={() => pickDay(d)}>
                    <View style={[styles.day, sel && styles.daySel]}>
                      <Text style={[styles.dayText, today && !sel && styles.dayToday, sel && styles.daySelText]}>{d}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.mgrid}>
            {Array.from({ length: 12 }, (_, mo) => {
              const cur = mo === viewMonth && y === viewYear;
              return (
                <Pressable key={mo} style={styles.mcell} onPress={() => pickMonth(mo)}>
                  <View style={[styles.mo, cur && styles.moSel]}>
                    <Text style={[styles.moText, cur && styles.moSelText]}>
                      {lang === 'ja' ? `${mo + 1}月` : MONTHS_EN[mo]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,28,0.18)' },
  card: { position: 'absolute', left: 18, width: 300, backgroundColor: color.bg, borderRadius: radius.cardL, padding: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  nav: { padding: 4 },
  titleBtn: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: font.size.title, fontWeight: '700', color: color.ink },
  row: { flexDirection: 'row' },
  dow: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, color: color.muted, paddingBottom: 6 },
  sun: { color: color.red },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dcell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  daySel: { backgroundColor: color.teal },
  dayText: { fontSize: font.size.body, color: color.ink },
  dayToday: { color: color.teal, fontWeight: '700' },
  daySelText: { color: '#fff', fontWeight: '700' },
  mgrid: { flexDirection: 'row', flexWrap: 'wrap' },
  mcell: { width: '25%', padding: 4, alignItems: 'center' },
  mo: { width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  moSel: { backgroundColor: color.teal },
  moText: { fontSize: font.size.body, color: color.ink },
  moSelText: { color: '#fff', fontWeight: '700' },
});
