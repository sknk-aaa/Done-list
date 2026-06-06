import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTags } from '@/data/useData';
import { Calendar, ChevronDown, Clock } from '@/icons';
import { formatLong, formatTime, getTodayISO, timeToDate } from '@/lib/date';
import { ensureNotificationPermission } from '@/lib/notifications';
import { removeTask, saveEditTask, saveNewTask } from '@/lib/taskActions';
import { useAppStore } from '@/state/store';
import { color, font, radius } from '@/theme/tokens';

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
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ja' ? 'ja' : 'en';
  const sheet = useAppStore((s) => s.sheet);
  const closeSheet = useAppStore((s) => s.closeSheet);
  const showTime = useAppStore((s) => s.showTime);
  const setTagEditOpen = useAppStore((s) => s.setTagEditOpen);
  const tags = useTags();

  const visible = sheet.mode !== null;
  const editing = sheet.mode === 'edit' ? sheet.editingItem : null;

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
    const id = setTimeout(() => nameRef.current?.focus(), 320);
    return () => clearTimeout(id);
  }, [sheet.mode]);

  const canSave = title.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    const input = {
      title: title.trim(),
      memo: memo.trim() || null,
      date,
      time: showTime ? time : null,
      notifyEnabled: showTime ? notify : false,
      tagId,
    };
    if (sheet.mode === 'edit' && editing) await saveEditTask(editing.id, input);
    else await saveNewTask(input);
    closeSheet();
  };

  const onDelete = async () => {
    if (!editing) return;
    await removeTask(editing.id);
    closeSheet();
  };

  const onToggleNotify = async (v: boolean) => {
    if (v && Platform.OS !== 'web') await ensureNotificationPermission();
    setNotify(v);
  };

  return (
    <BottomSheet visible={visible} onClose={closeSheet}>
      <SheetHeader
        left={{ label: t('common.cancel'), onPress: closeSheet, muted: true }}
        title={sheet.mode === 'edit' ? '' : t('sheet.addTitle')}
        right={{ label: t('common.save'), onPress: onSave, disabled: !canSave }}
      />
      <View style={styles.body}>
        <TextInput
          ref={nameRef}
          style={styles.nameInput}
          placeholder={t('sheet.namePlaceholder')}
          placeholderTextColor={color.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={styles.label}>{t('sheet.memo')}</Text>
        <TextInput
          style={[styles.field, styles.memoInput]}
          placeholder={t('sheet.memoPlaceholder')}
          placeholderTextColor={color.muted}
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

        {showTime && (
          <>
            <Text style={styles.label}>{t('sheet.time')}</Text>
            <Pressable style={styles.field} onPress={() => Platform.OS !== 'web' && setShowPicker(true)}>
              <Text style={[styles.fieldText, !time && styles.placeholder]}>{time ?? '--:--'}</Text>
              <Clock size={18} color={color.muted} />
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
          </>
        )}

        {sheet.mode === 'edit' && (
          <Pressable onPress={onDelete} style={styles.delBtn}>
            <Text style={styles.delText}>{t('sheet.deleteTask')}</Text>
          </Pressable>
        )}
        <View style={styles.bottomPad} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 4 },
  nameInput: {
    backgroundColor: color.field,
    borderRadius: radius.field,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: font.size.h2,
    fontWeight: '500',
    color: color.ink,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  labelInline: { fontSize: font.size.body, color: color.muted },
  label: { fontSize: font.size.body, color: color.muted, marginTop: 18, marginBottom: 8 },
  link: { fontSize: font.size.body, fontWeight: '600', color: color.teal },
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
  pillIdle: { borderColor: color.line },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: font.size.body, fontWeight: '600', color: color.ink },
  field: {
    backgroundColor: color.field,
    borderRadius: radius.field,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldText: { fontSize: font.size.title, color: color.ink },
  dateText: { flex: 1 },
  placeholder: { color: color.muted },
  notifyRow: {
    backgroundColor: color.bgSoft,
    borderRadius: radius.field,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: { fontSize: font.size.caption, color: color.muted, marginTop: 6, marginLeft: 4 },
  memoInput: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top', alignItems: 'flex-start' },
  delBtn: { marginTop: 26, alignItems: 'center', paddingVertical: 12 },
  delText: { fontSize: font.size.title, fontWeight: '600', color: color.red },
  bottomPad: { height: 28 },
});
