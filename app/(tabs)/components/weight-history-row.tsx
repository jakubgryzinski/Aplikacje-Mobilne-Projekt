import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { WeightHistoryEntry } from '@/store/profile-types';

import { ProfileActionButton } from './profile-action-button';
import {
  formatDateInputFromIso,
  formatMeasurementDateForDisplay,
  parseMeasurementDateInput,
  parsePositiveNumberInput,
} from './profile-form-utils';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';

type WeightHistoryRowProps = {
  entry: WeightHistoryEntry;
  isEditing: boolean;
  isInteractionDisabled: boolean;
  locale: string;
  onCancelEditing: () => void;
  onDelete: (id: number) => Promise<void>;
  onSave: (id: number, measuredAt: string, weightKilograms: number) => Promise<void>;
  onStartEditing: (id: number) => void;
};

type ValidationState = {
  form?: string;
  measurementDate?: string;
  weight?: string;
};

const errorTextColor = {
  dark: '#FF8A80',
  light: '#C62828',
} as const;

export function WeightHistoryRow({
  entry,
  isEditing,
  isInteractionDisabled,
  locale,
  onCancelEditing,
  onDelete,
  onSave,
  onStartEditing,
}: WeightHistoryRowProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const [measurementDateInput, setMeasurementDateInput] = useState(
    formatDateInputFromIso(entry.measuredAt)
  );
  const [weightInput, setWeightInput] = useState(String(entry.weightKilograms));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({});

  useEffect(() => {
    if (!isEditing) {
      setMeasurementDateInput(formatDateInputFromIso(entry.measuredAt));
      setWeightInput(String(entry.weightKilograms));
      setValidationState({});
    }
  }, [entry, isEditing]);

  async function saveRow() {
    if (isSubmitting) {
      return;
    }

    const nextValidationState: ValidationState = {};
    const normalizedMeasuredAt = parseMeasurementDateInput(measurementDateInput);
    const parsedWeightKilograms = parsePositiveNumberInput(weightInput);

    if (measurementDateInput.trim().length === 0) {
      nextValidationState.measurementDate = t(
        'tabScreens.profile.validation.measurementDateRequired'
      );
    } else if (!normalizedMeasuredAt) {
      nextValidationState.measurementDate = t(
        'tabScreens.profile.validation.measurementDateInvalid'
      );
    }

    if (parsedWeightKilograms === null) {
      nextValidationState.weight = t('tabScreens.profile.validation.weightRequired');
    } else if (parsedWeightKilograms === undefined) {
      nextValidationState.weight = t('tabScreens.profile.validation.weightInvalid');
    }

    if (Object.keys(nextValidationState).length > 0) {
      setValidationState(nextValidationState);
      return;
    }

    if (!normalizedMeasuredAt || parsedWeightKilograms === null || parsedWeightKilograms === undefined) {
      return;
    }

    setIsSubmitting(true);
    setValidationState({});

    try {
      await onSave(entry.id, normalizedMeasuredAt, parsedWeightKilograms);
    } catch {
      setValidationState({
        form: t('tabScreens.profile.weightHistory.updateError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteRow() {
    if (isSubmitting || isInteractionDisabled) {
      return;
    }

    setIsSubmitting(true);
    setValidationState({});

    try {
      await onDelete(entry.id);
    } catch {
      setValidationState({
        form: t('tabScreens.profile.weightHistory.deleteError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}>
      {isEditing ? (
        <ThemedView style={styles.editingContent}>
          <ProfileTextField
            editable={!isSubmitting}
            keyboardType="numbers-and-punctuation"
            label={t('tabScreens.profile.fields.measurementDate')}
            onChangeText={(value) => {
              setMeasurementDateInput(value);

              if (validationState.measurementDate || validationState.form) {
                setValidationState((currentState) => ({
                  ...currentState,
                  form: undefined,
                  measurementDate: undefined,
                }));
              }
            }}
            placeholder={t('tabScreens.profile.placeholders.measurementDate')}
            value={measurementDateInput}
          />
          {validationState.measurementDate ? (
            <ThemedText style={{ color: errorTextColor[theme] }}>
              {validationState.measurementDate}
            </ThemedText>
          ) : null}

          <ProfileNumberField
            editable={!isSubmitting}
            label={t('tabScreens.profile.fields.currentWeight')}
            onChangeText={(value) => {
              setWeightInput(value);

              if (validationState.weight || validationState.form) {
                setValidationState((currentState) => ({
                  ...currentState,
                  form: undefined,
                  weight: undefined,
                }));
              }
            }}
            placeholder={t('tabScreens.profile.placeholders.currentWeight')}
            unitLabel={t('tabScreens.profile.units.kilograms')}
            value={weightInput}
          />
          {validationState.weight ? (
            <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.weight}</ThemedText>
          ) : null}

          {validationState.form ? (
            <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.form}</ThemedText>
          ) : null}

          <ThemedView style={styles.actions}>
            <ProfileActionButton
              disabled={isSubmitting}
              isPrimary
              label={t('tabScreens.profile.weightHistory.saveAction')}
              onPress={() => {
                void saveRow();
              }}
            />
            <ProfileActionButton
              disabled={isSubmitting}
              label={t('tabScreens.profile.weightHistory.cancelAction')}
              onPress={onCancelEditing}
            />
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.displayContent}>
          <ThemedView style={styles.entrySummary}>
            <ThemedText type="defaultSemiBold">
              {formatMeasurementDateForDisplay(entry.measuredAt, locale)}
            </ThemedText>
            <ThemedText style={{ color: palette.mutedText }}>
              {`${entry.weightKilograms} ${t('tabScreens.profile.units.kilograms')}`}
            </ThemedText>
          </ThemedView>

          {validationState.form ? (
            <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.form}</ThemedText>
          ) : null}

          <ThemedView style={styles.actions}>
            <ProfileActionButton
              disabled={isInteractionDisabled || isSubmitting}
              label={t('tabScreens.profile.weightHistory.editAction')}
              onPress={() => onStartEditing(entry.id)}
            />
            <ProfileActionButton
              disabled={isInteractionDisabled || isSubmitting}
              label={t('tabScreens.profile.weightHistory.deleteAction')}
              onPress={() => {
                void deleteRow();
              }}
            />
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  displayContent: {
    gap: 12,
  },
  editingContent: {
    gap: 12,
  },
  entrySummary: {
    gap: 4,
  },
});
