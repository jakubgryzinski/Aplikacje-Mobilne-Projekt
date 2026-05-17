import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProfileOverviewSection } from './components/ProfileOverviewSection';
import { WeightHistorySection } from './components/WeightHistorySection';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title">{t('tabScreens.profile.title')}</ThemedText>
          </View>

          <ProfileOverviewSection />
          <WeightHistorySection />
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
    paddingTop: 20,
    paddingBottom: 28,
    gap: 24,
  },
  header: {
    gap: 4,
  },
});
