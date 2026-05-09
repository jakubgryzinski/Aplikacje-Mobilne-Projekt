import i18n from '@/i18n';
import { saveLanguagePreference, saveThemePreference } from '@/database/settings-repository';
import type { AppLanguage, ThemePreference } from '@/store/app-settings';
import { useAppSettingsStore } from '@/store/app-settings';

export async function updateThemePreference(themePreference: ThemePreference) {
  const previousThemePreference = useAppSettingsStore.getState().themePreference;

  useAppSettingsStore.getState().setThemePreference(themePreference);

  try {
    await saveThemePreference(themePreference);
  } catch (error) {
    useAppSettingsStore.getState().setThemePreference(previousThemePreference);
    console.error('Failed to save theme preference.', error);
  }
}

export async function updateLanguagePreference(languagePreference: AppLanguage) {
  const previousLanguagePreference = useAppSettingsStore.getState().languagePreference;

  useAppSettingsStore.getState().setLanguagePreference(languagePreference);

  try {
    await saveLanguagePreference(languagePreference);
  } catch (error) {
    useAppSettingsStore.getState().setLanguagePreference(previousLanguagePreference);
    await i18n.changeLanguage(previousLanguagePreference);
    console.error('Failed to save language preference.', error);
  }
}
