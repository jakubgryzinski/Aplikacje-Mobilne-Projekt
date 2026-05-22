import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
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

function RootLayoutContent() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const isSettingsHydrated = useAppSettingsStore((state) => state.isHydrated);
  const isProfileHydrated = useProfileStore((state) => state.isHydrated);
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const hydrateSettings = useAppSettingsStore((state) => state.hydrateSettings);

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        console.debug('[Bootstrap] Starting app initialization');
        
        try {
          console.debug('[Bootstrap] Initializing settings storage');
          await initializeSettingsStorage();
          const settings = await loadSettings();

          console.debug('[Bootstrap] Settings loaded:', { 
            themePreference: settings.themePreference,
            languagePreference: settings.languagePreference 
          });
          
          hydrateSettings(settings);
          await i18n.changeLanguage(settings.languagePreference);
        } catch (error) {
          console.error('[Bootstrap] Failed to initialize app settings.', error);
          
          const fallbackSettings: AppSettings = {
            themePreference: 'light',
            languagePreference: resolveAppLanguage(i18n.language),
          };

          hydrateSettings(fallbackSettings);
          await i18n.changeLanguage(fallbackSettings.languagePreference);
        }

        try {
          console.debug('[Bootstrap] Hydrating profile state');
          await hydrateProfileState();
          console.debug('[Bootstrap] Profile state hydrated successfully');
        } catch (error) {
          console.error('[Bootstrap] Failed to hydrate profile state', error);
          throw error;
        }
      } catch (error) {
        console.error('[Bootstrap] Fatal error during app initialization', error);
      } finally {
        try {
          await SplashScreen.hideAsync();
          console.debug('[Bootstrap] Splash screen hidden');
        } catch (error) {
          console.error('[Bootstrap] Failed to hide splash screen', error);
        }
      }
    };

    void bootstrapApp();
  }, [hydrateSettings]);

  useEffect(() => {
    if (!isSettingsHydrated || i18n.language === languagePreference) {
      return;
    }

    void i18n.changeLanguage(languagePreference);
  }, [isSettingsHydrated, languagePreference]);

  if (!isSettingsHydrated || !isProfileHydrated) {
    console.debug('[RootLayout] Still hydrating:', {
      isSettingsHydrated,
      isProfileHydrated,
    });
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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}