import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { useMigrations } from '@/db/client';
import { color, font } from '@/theme/tokens';

export default function RootLayout() {
  const { success, error } = useMigrations();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>DB migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={color.teal} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  errText: { color: color.red, fontSize: font.size.body, padding: 24, textAlign: 'center' },
});
