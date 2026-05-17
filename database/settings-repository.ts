import { getDatabase } from '@/database/sqlite';
import { resolveAppLanguage } from '@/i18n';
import type { AppLanguage, AppSettings, ThemePreference } from '@/store/app-settings';

type RawSettingRow = {
  key: string;
  value: string;
};

const SETTINGS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;

const THEME_KEY = 'themePreference';
const LANGUAGE_KEY = 'languagePreference';

const getDefaultSettings = (): AppSettings => ({
  themePreference: 'light',
  languagePreference: resolveAppLanguage(Intl.DateTimeFormat().resolvedOptions().locale),
});

const isThemePreference = (value: string): value is ThemePreference =>
  value === 'light' || value === 'dark';

const isAppLanguage = (value: string): value is AppLanguage =>
  value === 'en' || value === 'pl';

const normalizeSettings = (rows: RawSettingRow[]): AppSettings => {
  const defaults = getDefaultSettings();
  const themeValue = rows.find((row) => row.key === THEME_KEY)?.value;
  const languageValue = rows.find((row) => row.key === LANGUAGE_KEY)?.value;

  return {
    themePreference: themeValue && isThemePreference(themeValue) ? themeValue : defaults.themePreference,
    languagePreference:
      languageValue && isAppLanguage(languageValue) ? languageValue : defaults.languagePreference,
  };
};

export async function initializeSettingsStorage() {
  const database = await getDatabase();
  const defaults = getDefaultSettings();

  await database.execAsync(SETTINGS_TABLE_SQL);
  await database.runAsync(
    `INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?), (?, ?);`,
    THEME_KEY,
    defaults.themePreference,
    LANGUAGE_KEY,
    defaults.languagePreference
  );
}

export async function loadSettings(): Promise<AppSettings> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<RawSettingRow>(
    `SELECT key, value FROM app_settings WHERE key IN (?, ?);`,
    THEME_KEY,
    LANGUAGE_KEY
  );
  const settings = normalizeSettings(rows);

  await saveThemePreference(settings.themePreference);
  await saveLanguagePreference(settings.languagePreference);

  return settings;
}

export async function saveThemePreference(themePreference: ThemePreference) {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    THEME_KEY,
    themePreference
  );
}

export async function saveLanguagePreference(languagePreference: AppLanguage) {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    LANGUAGE_KEY,
    languagePreference
  );
}
