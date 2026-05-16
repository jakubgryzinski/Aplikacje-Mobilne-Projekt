import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { createProfileWeightEntry } from '@/store/profile-actions';

import {
  getTodayDateInput,
  parseMeasurementDateInput,
  parsePositiveNumberInput,
} from './profile-form-utils';
import { ProfileActionButton } from './profile-action-button';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';

type ValidationState = {
  form?: string;
  measurementDate?: string;
  weight?: string;
};

const errorTextColor = {
  dark: '#FF8A80',
  light: '#C62828',
} as const;

export function ProfileWeightEntryForm() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const [measurementDateInput, setMeasurementDateInput] = useState(getTodayDateInput());
  const [weightInput, setWeightInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({});

  async function onSave() {
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

    if (
      !normalizedMeasuredAt ||
      parsedWeightKilograms === null ||
      parsedWeightKilograms === undefined
    ) {
      return;
    }

    setIsSubmitting(true);
    setValidationState({});

    try {
      await createProfileWeightEntry({
        measuredAt: normalizedMeasuredAt,
        weightKilograms: parsedWeightKilograms,
      });
      setMeasurementDateInput(getTodayDateInput());
      setWeightInput('');
    } catch {
      setValidationState({
        form: t('tabScreens.profile.weightEntry.saveError'),
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
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('tabScreens.profile.weightEntry.title')}</ThemedText>
      </View>

      <ProfileTextField
        accessibilityLabel={t('tabScreens.profile.fields.measurementDate')}
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
        accessibilityLabel={t('tabScreens.profile.fields.currentWeight')}
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

      <View style={styles.actions}>
        <ProfileActionButton
          disabled={isSubmitting}
          isPrimary
          label={t('tabScreens.profile.weightEntry.saveAction')}
          onPress={() => {
            void onSave();
          }}
        />
      </View>
    </ThemedView>
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
  header: {
    gap: 4,
  },
});
