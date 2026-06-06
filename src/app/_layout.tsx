import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { useMigrations } from '@/db/client';
import { initApp } from '@/db/queries';
import { useAppStore } from '@/state/store';
import { ThemeProvider, useColors } from '@/theme/theme';
import { color, font } from '@/theme/tokens';

function ThemedStack() {
  const c = useColors();
  const dark = useAppStore((s) => s.darkMode && s.isPro);
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
    </>
  );
}

export default function RootLayout() {
  const { success, error } = useMigrations();
  const [ready, setReady] = useState(false);
  const hydrateSettings = useAppStore((s) => s.hydrateSettings);
  const setDarkMode = useAppStore((s) => s.setDarkMode);

  useEffect(() => {
    if (!success) return;
    let active = true;
    (async () => {
      const settings = await initApp();
      const dark = await AsyncStorage.getItem('todone_dark');
      if (!active) return;
      hydrateSettings(settings);
      if (dark === '1') setDarkMode(true);
      if (settings.locale) i18n.changeLanguage(settings.locale);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [success, hydrateSettings, setDarkMode]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>DB migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success || !ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={color.teal} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <ThemedStack />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  errText: { color: color.red, fontSize: font.size.body, padding: 24, textAlign: 'center' },
});
