import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  createProfileWeightEntry,
  saveProfileIdentity,
} from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';
import type { ProfileDetails, ProfileGender } from '@/store/profile-types';

import { OptionToggleGroup } from './option-toggle-group';
import { ProfileActionButton } from './profile-action-button';
import {
  formatOptionalNumber,
  getTodayDateInput,
  parseMeasurementDateInput,
  parsePositiveNumberInput,
} from './profile-form-utils';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';

type ValidationState = {
  form?: string;
  height?: string;
  measurementDate?: string;
  name?: string;
  weight?: string;
};

const errorTextColor = {
  dark: '#FF8A80',
  light: '#C62828',
} as const;

export function ProfileDetailsForm() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const profileDetails = useProfileStore((state) => state.profileDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInput, setNameInput] = useState(profileDetails.name);
  const [draftGender, setDraftGender] = useState<ProfileGender | null>(profileDetails.gender);
  const [heightInput, setHeightInput] = useState(
    formatOptionalNumber(profileDetails.heightCentimeters)
  );
  const [newMeasurementDateInput, setNewMeasurementDateInput] = useState(getTodayDateInput());
  const [newWeightInput, setNewWeightInput] = useState('');
  const [didEditMeasurementDate, setDidEditMeasurementDate] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({});

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
    setNewMeasurementDateInput(getTodayDateInput());
    setNewWeightInput('');
    setDidEditMeasurementDate(false);
    setValidationState({});
  }, [isEditing, profileDetails]);

  function startEditing() {
    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
    setNewMeasurementDateInput(getTodayDateInput());
    setNewWeightInput('');
    setDidEditMeasurementDate(false);
    setValidationState({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
    setNewMeasurementDateInput(getTodayDateInput());
    setNewWeightInput('');
    setDidEditMeasurementDate(false);
    setValidationState({});
    setIsEditing(false);
  }

  function updateValidationState(partialState: ValidationState) {
    setValidationState((currentState) => ({
      ...currentState,
      ...partialState,
    }));
  }

  function onNameChange(value: string) {
    setNameInput(value);

    if (validationState.name || validationState.form) {
      updateValidationState({
        form: undefined,
        name: undefined,
      });
    }
  }

  function onHeightChange(value: string) {
    setHeightInput(value);

    if (validationState.height || validationState.form) {
      updateValidationState({
        form: undefined,
        height: undefined,
      });
    }
  }

  function onMeasurementDateChange(value: string) {
    setNewMeasurementDateInput(value);
    setDidEditMeasurementDate(true);

    if (validationState.measurementDate || validationState.form) {
      updateValidationState({
        form: undefined,
        measurementDate: undefined,
      });
    }
  }

  function onWeightChange(value: string) {
    setNewWeightInput(value);

    if (validationState.weight || validationState.form) {
      updateValidationState({
        form: undefined,
        weight: undefined,
      });
    }
  }

  async function onSave() {
    if (isSubmitting) {
      return;
    }

    const nextValidationState: ValidationState = {};
    const trimmedName = nameInput.trim();
    const parsedHeightCentimeters = parsePositiveNumberInput(heightInput);
    const shouldCreateNewWeightEntry =
      newWeightInput.trim().length > 0 || didEditMeasurementDate;

    if (trimmedName.length === 0) {
      nextValidationState.name = t('tabScreens.profile.validation.nameRequired');
    }

    if (parsedHeightCentimeters === null) {
      nextValidationState.height = t('tabScreens.profile.validation.heightRequired');
    } else if (parsedHeightCentimeters === undefined) {
      nextValidationState.height = t('tabScreens.profile.validation.heightInvalid');
    }

    let normalizedMeasuredAt: string | undefined;
    let parsedWeightKilograms: number | null | undefined = null;

    if (shouldCreateNewWeightEntry) {
      if (newWeightInput.trim().length === 0) {
        nextValidationState.weight = t('tabScreens.profile.validation.weightRequired');
      } else {
        parsedWeightKilograms = parsePositiveNumberInput(newWeightInput);

        if (parsedWeightKilograms === null || parsedWeightKilograms === undefined) {
          nextValidationState.weight = t('tabScreens.profile.validation.weightInvalid');
        }
      }

      if (newMeasurementDateInput.trim().length === 0) {
        nextValidationState.measurementDate = t(
          'tabScreens.profile.validation.measurementDateRequired'
        );
      } else {
        normalizedMeasuredAt = parseMeasurementDateInput(newMeasurementDateInput);

        if (!normalizedMeasuredAt) {
          nextValidationState.measurementDate = t(
            'tabScreens.profile.validation.measurementDateInvalid'
          );
        }
      }
    }

    if (Object.keys(nextValidationState).length > 0) {
      setValidationState(nextValidationState);
      return;
    }

    const nextProfileDetails: ProfileDetails = {
      avatarUri: profileDetails.avatarUri,
      name: trimmedName,
      gender: draftGender,
      heightCentimeters: parsedHeightCentimeters ?? null,
    };

    setIsSubmitting(true);
    setValidationState({});

    try {
      await saveProfileIdentity(nextProfileDetails);

      if (
        shouldCreateNewWeightEntry &&
        parsedWeightKilograms !== null &&
        parsedWeightKilograms !== undefined &&
        normalizedMeasuredAt
      ) {
        await createProfileWeightEntry({
          measuredAt: normalizedMeasuredAt,
          weightKilograms: parsedWeightKilograms,
        });
      }

      setNewMeasurementDateInput(getTodayDateInput());
      setNewWeightInput('');
      setDidEditMeasurementDate(false);
      setIsEditing(false);
    } catch {
      setValidationState({
        form: t('tabScreens.profile.form.saveError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.form}>
      <ProfileTextField
        accessibilityLabel={t('tabScreens.profile.fields.name')}
        editable={isEditing}
        label={t('tabScreens.profile.fields.name')}
        onChangeText={onNameChange}
        placeholder={t('tabScreens.profile.placeholders.name')}
        value={nameInput}
      />
      {validationState.name ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.name}</ThemedText>
      ) : null}

      <ThemedView style={styles.field}>
        <ThemedText type="defaultSemiBold">{t('tabScreens.profile.fields.gender')}</ThemedText>
        <OptionToggleGroup
          accessibilityLabel={t('tabScreens.profile.fields.gender')}
          disabled={!isEditing || isSubmitting}
          onChange={setDraftGender}
          options={[
            { label: t('tabScreens.profile.gender.male'), value: 'male' },
            { label: t('tabScreens.profile.gender.female'), value: 'female' },
          ]}
          selectedValue={draftGender}
        />
      </ThemedView>

      <ProfileNumberField
        accessibilityLabel={t('tabScreens.profile.fields.height')}
        editable={isEditing}
        label={t('tabScreens.profile.fields.height')}
        onChangeText={onHeightChange}
        placeholder={t('tabScreens.profile.placeholders.height')}
        unitLabel={t('tabScreens.profile.units.centimeters')}
        value={heightInput}
      />
      {validationState.height ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.height}</ThemedText>
      ) : null}

      <ThemedView style={styles.weightDraftSection}>
        <ThemedText type="defaultSemiBold">{t('tabScreens.profile.sections.weight')}</ThemedText>
        <ThemedText style={{ color: palette.mutedText }}>
          {t('tabScreens.profile.weightHistory.description')}
        </ThemedText>
      </ThemedView>

      <ProfileTextField
        accessibilityLabel={t('tabScreens.profile.fields.measurementDate')}
        editable={isEditing}
        keyboardType="numbers-and-punctuation"
        label={t('tabScreens.profile.fields.measurementDate')}
        onChangeText={onMeasurementDateChange}
        placeholder={t('tabScreens.profile.placeholders.measurementDate')}
        value={newMeasurementDateInput}
      />
      {validationState.measurementDate ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>
          {validationState.measurementDate}
        </ThemedText>
      ) : null}

      <ProfileNumberField
        accessibilityLabel={t('tabScreens.profile.fields.currentWeight')}
        editable={isEditing}
        label={t('tabScreens.profile.fields.currentWeight')}
        onChangeText={onWeightChange}
        placeholder={t('tabScreens.profile.placeholders.currentWeight')}
        unitLabel={t('tabScreens.profile.units.kilograms')}
        value={newWeightInput}
      />
      {validationState.weight ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.weight}</ThemedText>
      ) : null}

      {validationState.form ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.form}</ThemedText>
      ) : null}

      <ThemedView style={styles.actions}>
        {isEditing ? (
          <>
            <ProfileActionButton
              disabled={isSubmitting}
              isPrimary
              label={t('tabScreens.profile.form.saveAction')}
              onPress={() => {
                void onSave();
              }}
            />
            <ProfileActionButton
              disabled={isSubmitting}
              label={t('tabScreens.profile.form.cancelAction')}
              onPress={cancelEditing}
            />
          </>
        ) : (
          <ProfileActionButton
            label={t('tabScreens.profile.form.editAction')}
            onPress={startEditing}
          />
        )}
      </ThemedView>

      {!isEditing ? (
        <ThemedView style={[styles.readOnlyHint, { borderColor: palette.border }]}>
          <ThemedText style={{ color: palette.mutedText }}>
            {t('tabScreens.profile.form.readOnlyHint')}
          </ThemedText>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    gap: 8,
  },
  form: {
    gap: 12,
  },
  readOnlyHint: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  weightDraftSection: {
    gap: 4,
  },
});
