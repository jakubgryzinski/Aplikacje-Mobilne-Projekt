import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { updateLanguagePreference, updateThemePreference } from '@/store/app-settings-actions';
import { useAppSettingsStore } from '@/store/app-settings';

import { OptionToggleGroup } from './components/option-toggle-group';
import { ProfileAvatarSection } from './components/profile-avatar-section';
import { ProfileDetailsForm } from './components/profile-details-form';
import { ProfileSettingSection } from './components/profile-setting-section';
import { WeightHistorySection } from './components/weight-history-section';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const themePreference = useAppSettingsStore((state) => state.themePreference);
  const palette = Colors[theme];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">{t('tabScreens.profile.title')}</ThemedText>
            <ThemedText style={{ color: palette.mutedText }}>
              {t('tabScreens.profile.description')}
            </ThemedText>
          </ThemedView>

          <ProfileSettingSection title={t('tabScreens.profile.sections.avatar')}>
            <ProfileAvatarSection />
          </ProfileSettingSection>

          <ProfileSettingSection title={t('tabScreens.profile.sections.profileDetails')}>
            <ProfileDetailsForm />
          </ProfileSettingSection>

          <ProfileSettingSection title={t('tabScreens.profile.weightHistory.title')}>
            <WeightHistorySection />
          </ProfileSettingSection>

          <ProfileSettingSection title={t('tabScreens.profile.sections.appearance')}>
            <ThemedText style={{ color: palette.mutedText }}>
              {t('tabScreens.profile.theme.description')}
            </ThemedText>
            <OptionToggleGroup
              accessibilityLabel={t('tabScreens.profile.sections.appearance')}
              onChange={(value) => {
                void updateThemePreference(value);
              }}
              options={[
                { label: t('tabScreens.profile.theme.light'), value: 'light' },
                { label: t('tabScreens.profile.theme.dark'), value: 'dark' },
              ]}
              selectedValue={themePreference}
            />
          </ProfileSettingSection>

          <ProfileSettingSection title={t('tabScreens.profile.sections.language')}>
            <ThemedText style={{ color: palette.mutedText }}>
              {t('tabScreens.profile.language.description')}
            </ThemedText>
            <OptionToggleGroup
              accessibilityLabel={t('tabScreens.profile.sections.language')}
              onChange={(value) => {
                void updateLanguagePreference(value);
              }}
              options={[
                { label: t('tabScreens.profile.language.en'), value: 'en' },
                { label: t('tabScreens.profile.language.pl'), value: 'pl' },
              ]}
              selectedValue={languagePreference}
            />
          </ProfileSettingSection>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    gap: 8,
  },
});
