import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
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
  onRequestDelete: (id: number) => void;
  onSave: (id: number, measuredAt: string, weightKilograms: number) => Promise<void>;
  onStartEditing: (id: number) => void;
};

type ValidationState = {
  form?: string;
  measurementDate?: string;
  weight?: string;
};

export function WeightHistoryRow({
  entry,
  isEditing,
  isInteractionDisabled,
  locale,
  onCancelEditing,
  onRequestDelete,
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
      nextValidationState.measurementDate = t('tabs.profile.weight.measurementDate.required');
    } else if (!normalizedMeasuredAt) {
      nextValidationState.measurementDate = t('tabs.profile.weight.measurementDate.invalid');
    }

    if (parsedWeightKilograms === null) {
      nextValidationState.weight = t('tabs.profile.weight.value.required');
    } else if (parsedWeightKilograms === undefined) {
      nextValidationState.weight = t('tabs.profile.weight.value.invalid');
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
        form: t('tabs.profile.weight.history.updateError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}>
      {isEditing ? (
        <View style={styles.editingContent}>
          <ProfileTextField
            editable={!isSubmitting}
            keyboardType="numbers-and-punctuation"
            label={t('tabs.profile.weight.measurementDate.label')}
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
            placeholder={t('tabs.profile.weight.measurementDate.placeholder')}
            value={measurementDateInput}
          />
          {validationState.measurementDate ? (
            <ThemedText style={{ color: palette.errorText }}>
              {validationState.measurementDate}
            </ThemedText>
          ) : null}

          <ProfileNumberField
            editable={!isSubmitting}
            label={t('tabs.profile.weight.value.label')}
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
            placeholder={t('tabs.profile.weight.value.placeholder')}
            unitLabel={t('tabs.profile.weight.unit')}
            value={weightInput}
          />
          {validationState.weight ? (
            <ThemedText style={{ color: palette.errorText }}>{validationState.weight}</ThemedText>
          ) : null}

          {validationState.form ? (
            <ThemedText style={{ color: palette.errorText }}>{validationState.form}</ThemedText>
          ) : null}

          <View style={styles.actions}>
            <ProfileActionButton
              disabled={isSubmitting}
              isPrimary
              label={t('tabs.profile.weight.history.saveAction')}
              onPress={() => {
                void saveRow();
              }}
            />
            <ProfileActionButton
              disabled={isSubmitting}
              label={t('tabs.profile.weight.history.cancelAction')}
              onPress={onCancelEditing}
            />
          </View>
        </View>
      ) : (
        <View style={styles.displayContent}>
          <View style={styles.entrySummary}>
            <ThemedText type="defaultSemiBold">
              {formatMeasurementDateForDisplay(entry.measuredAt, locale)}
            </ThemedText>
            <ThemedText style={{ color: palette.mutedText }}>
              {`${entry.weightKilograms} ${t('tabs.profile.weight.unit')}`}
            </ThemedText>
          </View>

          {validationState.form ? (
            <ThemedText style={{ color: palette.errorText }}>{validationState.form}</ThemedText>
          ) : null}

          <View style={styles.actions}>
            <ProfileActionButton
              disabled={isInteractionDisabled || isSubmitting}
              label={t('tabs.profile.weight.history.editAction')}
              onPress={() => onStartEditing(entry.id)}
            />
            <ProfileActionButton
              disabled={isInteractionDisabled || isSubmitting}
              label={t('tabs.profile.weight.history.deleteAction')}
              onPress={() => onRequestDelete(entry.id)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  displayContent: {
    gap: 10,
  },
  editingContent: {
    gap: 10,
  },
  entrySummary: {
    gap: 4,
  },
});
