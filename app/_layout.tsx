import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { initializeSettingsStorage, loadSettings } from '@/database/settings-repository';
import i18n, { resolveAppLanguage } from '@/i18n';
import { useAppTheme } from '@/hooks/use-app-theme';
import { hydrateProfileState } from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';
import { type AppSettings, useAppSettingsStore } from '@/store/app-settings';

export const unstable_settings = {
  anchor: '(tabs)',
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const isSettingsHydrated = useAppSettingsStore((state) => state.isHydrated);
  const isProfileHydrated = useProfileStore((state) => state.isHydrated);
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const hydrateSettings = useAppSettingsStore((state) => state.hydrateSettings);

  useEffect(() => {
    async function bootstrapApp() {
      try {
        await initializeSettingsStorage();
        const settings = await loadSettings();

        hydrateSettings(settings);
        await i18n.changeLanguage(settings.languagePreference);
      } catch (error) {
        const fallbackSettings: AppSettings = {
          themePreference: 'light',
          languagePreference: resolveAppLanguage(i18n.language),
        };

        hydrateSettings(fallbackSettings);
        await i18n.changeLanguage(fallbackSettings.languagePreference);
        console.error('Failed to initialize app settings.', error);
      }

      try {
        await hydrateProfileState();
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    void bootstrapApp();
  }, [hydrateSettings]);

  useEffect(() => {
    if (!isSettingsHydrated || i18n.language === languagePreference) {
      return;
    }

    void i18n.changeLanguage(languagePreference);
  }, [isSettingsHydrated, languagePreference]);

  if (!isSettingsHydrated || !isProfileHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: t('modalScreen.navigationTitle') }}
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
