import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DeleteDialog } from '@/components/DeleteDialog';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppSettingsStore } from '@/store/app-settings';
import {
  deleteProfileWeightEntry,
  updateProfileWeightEntry,
} from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';

import { ProfileWeightChart } from './ProfileWeightChart';
import { ProfileWeightEntryForm } from './ProfileWeightEntryForm';
import { WeightHistoryRow } from './WeightHistoryRow';

const getLocale = (languagePreference: 'en' | 'pl'): string =>
  languagePreference === 'pl' ? 'pl-PL' : 'en-US';

export function WeightHistorySection() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const weightHistoryEntries = useProfileStore((state) => state.weightHistoryEntries);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const locale = getLocale(languagePreference);
  const isDeleteDialogOpen = deleteEntryId !== null;

  const submitDelete = async () => {
    if (deleteEntryId === null || isDeletingEntry) {
      return;
    }

    setIsDeletingEntry(true);
    setDeleteError(null);

    try {
      await deleteProfileWeightEntry(deleteEntryId);

      if (editingEntryId === deleteEntryId) {
        setEditingEntryId(null);
      }

      setDeleteEntryId(null);
    } catch {
      setDeleteError(t('tabs.profile.weight.history.deleteError'));
    } finally {
      setIsDeletingEntry(false);
    }
  };

  return (
    <View style={styles.section}>
      <ProfileWeightEntryForm />
      <ProfileWeightChart />

      {deleteError ? (
        <ThemedText style={{ color: palette.errorText }}>{deleteError}</ThemedText>
      ) : null}

      {weightHistoryEntries.length === 0 ? (
        <ThemedText>{t('tabs.profile.weight.history.empty')}</ThemedText>
      ) : (
        <View style={styles.list}>
          {weightHistoryEntries.map((weightHistoryEntry) => (
            <WeightHistoryRow
              key={weightHistoryEntry.id}
              entry={weightHistoryEntry}
              isEditing={editingEntryId === weightHistoryEntry.id}
              isInteractionDisabled={
                deleteEntryId !== null ||
                (editingEntryId !== null && editingEntryId !== weightHistoryEntry.id)
              }
              locale={locale}
              onCancelEditing={() => {
                setEditingEntryId(null);
              }}
              onRequestDelete={(id) => {
                setDeleteError(null);
                setDeleteEntryId(id);
              }}
              onSave={async (id, measuredAt, weightKilograms) => {
                setDeleteError(null);
                await updateProfileWeightEntry(id, {
                  measuredAt,
                  weightKilograms,
                });
                setEditingEntryId(null);
              }}
              onStartEditing={(id) => {
                setDeleteError(null);
                setEditingEntryId(id);
              }}
            />
          ))}
        </View>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        message={t('tabs.profile.weight.history.deleteMessage')}
        onCancel={() => {
          if (isDeletingEntry) {
            return;
          }

          setDeleteEntryId(null);
        }}
        onSubmit={() => {
          void submitDelete();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  section: {
    gap: 16,
  },
});
