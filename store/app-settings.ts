import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark';
export type AppLanguage = 'en' | 'pl';

export type AppSettings = {
  themePreference: ThemePreference;
  languagePreference: AppLanguage;
};

export type AppSettingsState = AppSettings & {
  isHydrated: boolean;
  hydrateSettings: (settings: AppSettings) => void;
  setThemePreference: (themePreference: ThemePreference) => void;
  setLanguagePreference: (languagePreference: AppLanguage) => void;
};

const fallbackSettings: AppSettings = {
  themePreference: 'light',
  languagePreference: 'en',
};

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  ...fallbackSettings,
  isHydrated: false,
  hydrateSettings: (settings) => set({ ...settings, isHydrated: true }),
  setThemePreference: (themePreference) => set({ themePreference }),
  setLanguagePreference: (languagePreference) => set({ languagePreference }),
}));
