import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately after initial mount since we aren't loading heavy custom fonts yet
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[slug]" options={{ presentation: 'card' }} />
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(checkout)" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
