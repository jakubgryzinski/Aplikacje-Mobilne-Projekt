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

  try {
    console.debug('[Settings] Creating settings table');
    await database.execAsync(SETTINGS_TABLE_SQL);
    
    console.debug('[Settings] Inserting default settings');
    await database.runAsync(
      `INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?), (?, ?);`,
      THEME_KEY,
      defaults.themePreference,
      LANGUAGE_KEY,
      defaults.languagePreference
    );
    
    console.debug('[Settings] Settings storage initialized successfully');
  } catch (error) {
    console.error('[Settings] Failed to initialize settings storage', error);
    throw error;
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const database = await getDatabase();
  
  try {
    console.debug('[Settings] Loading settings from database');
    const rows = await database.getAllAsync<RawSettingRow>(
      `SELECT key, value FROM app_settings WHERE key IN (?, ?);`,
      THEME_KEY,
      LANGUAGE_KEY
    );
    
    const settings = normalizeSettings(rows);

    console.debug('[Settings] Settings loaded:', settings);

    await saveThemePreference(settings.themePreference);
    await saveLanguagePreference(settings.languagePreference);

    return settings;
  } catch (error) {
    console.error('[Settings] Failed to load settings', error);
    throw error;
  }
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