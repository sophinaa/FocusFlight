import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="FlightScreen" options={{ title: 'Flight' }} />
        <Stack.Screen name="StatsScreen" options={{ title: 'Stats' }} />
        <Stack.Screen name="map-style" options={{ title: 'Map Style' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
