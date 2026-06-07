import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { useTags } from '@/data/useData';
import { Calendar, ChevronDown, Clock } from '@/icons';
import { formatLong, formatTime, getTodayISO, timeToDate } from '@/lib/date';
import { ensureNotificationPermission } from '@/lib/notifications';
import { haptics } from '@/lib/haptics';
import { removeTask, saveEditTask, saveNewTask } from '@/lib/taskActions';
import { useAppStore } from '@/state/store';
import { font, radius } from '@/theme/tokens';
import { useColors, type Colors } from '@/theme/theme';

import { BottomSheet } from './BottomSheet';
import { MiniCalendar } from './MiniCalendar';
import { SheetHeader } from './SheetHeader';
import { Switch } from './Switch';

// Native-only time picker (avoid importing on web).
let DateTimePicker: typeof import('@react-native-community/datetimepicker').default | null = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export function AddEditSheet() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const sheet = useAppStore((s) => s.sheet);
  const closeSheet = useAppStore((s) => s.closeSheet);
  const setTagEditOpen = useAppStore((s) => s.setTagEditOpen);
  const showToast = useAppStore((s) => s.showToast);
  const tags = useTags();

  const visible = sheet.mode !== null;
  const editing = sheet.mode === 'edit' ? sheet.editingItem : null;

  // Keep the last open mode while the sheet animates closed (mode→null), so the
  // content doesn't flash to the "add" look (new title / no delete) on close.
  const [shownMode, setShownMode] = useState(sheet.mode);
  useEffect(() => {
    if (sheet.mode) setShownMode(sheet.mode);
  }, [sheet.mode]);

  const [title, setTitle] = useState('');
  const [tagId, setTagId] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notify, setNotify] = useState(false);
  const [date, setDate] = useState(getTodayISO());
  const [memo, setMemo] = useState('');
  const [showCal, setShowCal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (sheet.mode === 'add') {
      setTitle('');
      setTagId(null);
      setTime(null);
      setNotify(false);
      setDate(sheet.presetDate ?? getTodayISO());
      setMemo('');
    } else if (sheet.mode === 'edit' && sheet.editingItem) {
      const it = sheet.editingItem;
      setTitle(it.title);
      setTagId(it.tagId);
      setTime(it.time);
      setNotify(it.notifyEnabled);
      setDate(it.date);
      setMemo(it.memo ?? '');
    }
    setShowCal(false);
    setShowPicker(false);
  }, [sheet.mode, sheet.editingItem, sheet.presetDate]);

  // Focus the name field when opening the add sheet (after the open animation).
  const nameRef = useRef<TextInput>(null);
  useEffect(() => {
    if (sheet.mode !== 'add') return;
    const id = setTimeout(() => nameRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [sheet.mode]);

  const canSave = title.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    const input = {
      title: title.trim(),
      memo: memo.trim() || null,
      date,
      time,
      notifyEnabled: notify,
      tagId,
    };
    if (sheet.mode === 'edit' && editing) await saveEditTask(editing.id, input);
    else await saveNewTask(input);
    closeSheet();
  };

  const onDelete = async () => {
    if (!editing) return;
    haptics.medium();
    const it = editing;
    const restore = {
      title: it.title,
      memo: it.memo,
      date: it.date,
      time: it.time,
      notifyEnabled: it.notifyEnabled,
      tagId: it.tagId,
    };
    await removeTask(it.id);
    closeSheet();
    showToast(t('toast.deleted'), { label: t('toast.undo'), run: () => void saveNewTask(restore) });
  };

  const onToggleNotify = async (v: boolean) => {
    setNotify(v); // reflect intent immediately (don't block on permission)
    if (v && Platform.OS !== 'web') {
      try {
        await ensureNotificationPermission();
      } catch {
        // Expo Go / permission quirks: keep the toggle on; delivery needs a dev/prod build.
      }
    }
  };

  return (
    <BottomSheet visible={visible} onClose={closeSheet} keyboardAvoiding={false}>
      <SheetHeader
        left={{ label: t('common.cancel'), onPress: closeSheet, muted: true }}
        title={shownMode === 'edit' ? '' : t('sheet.addTitle')}
        right={{ label: t('common.save'), onPress: onSave, disabled: !canSave }}
      />
      <Pressable style={styles.body} onPress={() => Keyboard.dismiss()}>
        <TextInput
          ref={nameRef}
          style={styles.nameInput}
          placeholder={t('sheet.namePlaceholder')}
          placeholderTextColor={c.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={styles.label}>{t('sheet.memo')}</Text>
        <TextInput
          style={[styles.field, styles.memoInput]}
          placeholder={t('sheet.memoPlaceholder')}
          placeholderTextColor={c.muted}
          value={memo}
          onChangeText={setMemo}
          multiline
        />

        <View style={styles.labelRow}>
          <Text style={styles.labelInline}>{t('sheet.tag')}</Text>
          <Pressable onPress={() => setTagEditOpen(true)} hitSlop={6}>
            <Text style={styles.link}>{t('sheet.editTags')}</Text>
          </Pressable>
        </View>
        <View style={styles.tagWrap}>
          {tags.map((tg) => {
            const sel = tg.id === tagId;
            return (
              <Pressable
                key={tg.id}
                onPress={() => setTagId(sel ? null : tg.id)}
                style={[styles.pill, sel ? { borderColor: tg.color, backgroundColor: tg.color + '1F' } : styles.pillIdle]}
              >
                <View style={[styles.pillDot, { backgroundColor: tg.color }]} />
                <Text style={[styles.pillText, sel && { color: tg.color }]}>{tg.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{t('sheet.date')}</Text>
        <Pressable style={styles.field} onPress={() => setShowCal((v) => !v)}>
          <Calendar size={20} color="#8A8F94" />
          <Text style={[styles.fieldText, styles.dateText]}>{formatLong(date, lang, true)}</Text>
          <ChevronDown size={18} color="#B0B5B9" />
        </Pressable>
        {showCal && (
          <MiniCalendar
            value={date}
            todayISO={getTodayISO()}
            lang={lang}
            onPick={(iso) => {
              setDate(iso);
              setShowCal(false);
            }}
          />
        )}

        <Text style={styles.label}>{t('sheet.time')}</Text>
        <Pressable style={styles.field} onPress={() => Platform.OS !== 'web' && setShowPicker(true)}>
          <Text style={[styles.fieldText, !time && styles.placeholder]}>{time ?? '--:--'}</Text>
          <Clock size={18} color={c.muted} />
        </Pressable>
        <View style={styles.notifyRow}>
          <Text style={styles.fieldText}>{t('sheet.notify')}</Text>
          <Switch value={notify} onValueChange={onToggleNotify} />
        </View>
        {notify && !time && <Text style={styles.hint}>{t('sheet.notifyNoTime')}</Text>}
        {showPicker && DateTimePicker && (
          <DateTimePicker
            value={timeToDate(time)}
            mode="time"
            is24Hour
            onChange={(_e, d) => {
              setShowPicker(false);
              if (d) setTime(formatTime(d));
            }}
          />
        )}

        {shownMode === 'edit' && (
          <Pressable onPress={onDelete} style={styles.delBtn}>
            <Text style={styles.delText}>{t('sheet.deleteTask')}</Text>
          </Pressable>
        )}
        <View style={styles.bottomPad} />
      </Pressable>
    </BottomSheet>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 4 },
  nameInput: {
    backgroundColor: c.field,
    borderRadius: radius.field,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: font.size.input,
    fontWeight: '500',
    color: c.ink,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  labelInline: { fontSize: font.size.body, color: c.muted },
  label: { fontSize: font.size.body, color: c.muted, marginTop: 18, marginBottom: 8 },
  link: { fontSize: font.size.body, fontWeight: '600', color: c.teal },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillIdle: { borderColor: c.line },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: font.size.body, fontWeight: '600', color: c.ink },
  field: {
    backgroundColor: c.field,
    borderRadius: radius.field,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldText: { fontSize: font.size.title, color: c.ink },
  dateText: { flex: 1 },
  placeholder: { color: c.muted },
  notifyRow: {
    backgroundColor: c.bgSoft,
    borderRadius: radius.field,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: { fontSize: font.size.caption, color: c.muted, marginTop: 6, marginLeft: 4 },
  memoInput: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top', alignItems: 'flex-start' },
  delBtn: { marginTop: 26, alignItems: 'center', paddingVertical: 12 },
  delText: { fontSize: font.size.title, fontWeight: '600', color: c.red },
  bottomPad: { height: 28 },
});
