import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSettingsStore } from '@/store/app-settings';
import {
  deleteProfileWeightEntry,
  updateProfileWeightEntry,
} from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';

import { WeightHistoryRow } from './weight-history-row';

function getLocale(languagePreference: 'en' | 'pl'): string {
  return languagePreference === 'pl' ? 'pl-PL' : 'en-US';
}

export function WeightHistorySection() {
  const { t } = useTranslation();
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const weightHistoryEntries = useProfileStore((state) => state.weightHistoryEntries);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const locale = getLocale(languagePreference);

  return (
    <ThemedView style={styles.section}>
      <ThemedText>{t('tabScreens.profile.weightHistory.description')}</ThemedText>

      {weightHistoryEntries.length === 0 ? (
        <ThemedText>{t('tabScreens.profile.weightHistory.empty')}</ThemedText>
      ) : (
        <ThemedView style={styles.list}>
          {weightHistoryEntries.map((weightHistoryEntry) => (
            <WeightHistoryRow
              key={weightHistoryEntry.id}
              entry={weightHistoryEntry}
              isEditing={editingEntryId === weightHistoryEntry.id}
              isInteractionDisabled={
                editingEntryId !== null && editingEntryId !== weightHistoryEntry.id
              }
              locale={locale}
              onCancelEditing={() => {
                setEditingEntryId(null);
              }}
              onDelete={async (id) => {
                await deleteProfileWeightEntry(id);

                if (editingEntryId === id) {
                  setEditingEntryId(null);
                }
              }}
              onSave={async (id, measuredAt, weightKilograms) => {
                await updateProfileWeightEntry(id, {
                  measuredAt,
                  weightKilograms,
                });
                setEditingEntryId(null);
              }}
              onStartEditing={setEditingEntryId}
            />
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
});
