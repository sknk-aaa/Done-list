import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, font } from '@/theme/tokens';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.title}>やったこと管理</Text>
        <Text style={styles.sub}>環境セットアップ完了 — {t('tabs.daily')} / {t('tabs.month')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: font.size.h1, fontWeight: '700', color: color.ink },
  sub: { fontSize: font.size.body, color: color.muted },
});
