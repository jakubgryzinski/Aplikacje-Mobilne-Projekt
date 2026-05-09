import { useAppSettingsStore } from '@/store/app-settings';

export function useAppTheme() {
  return useAppSettingsStore((state) => state.themePreference);
}
