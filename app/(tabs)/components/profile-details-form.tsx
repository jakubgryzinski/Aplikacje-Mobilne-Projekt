import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { updateLanguagePreference, updateThemePreference } from '@/store/app-settings-actions';
import { useAppSettingsStore } from '@/store/app-settings';
import { saveProfileIdentity } from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';
import type { ProfileDetails, ProfileGender } from '@/store/profile-types';

import { OptionToggleGroup } from './option-toggle-group';
import { ProfileActionButton } from './profile-action-button';
import { formatOptionalNumber, parsePositiveNumberInput } from './profile-form-utils';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';

type ValidationState = {
  form?: string;
  height?: string;
  name?: string;
};

const errorTextColor = {
  dark: '#FF8A80',
  light: '#C62828',
} as const;

export function ProfileDetailsForm() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const profileDetails = useProfileStore((state) => state.profileDetails);
  const themePreference = useAppSettingsStore((state) => state.themePreference);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInput, setNameInput] = useState(profileDetails.name);
  const [draftGender, setDraftGender] = useState<ProfileGender | null>(profileDetails.gender);
  const [heightInput, setHeightInput] = useState(
    formatOptionalNumber(profileDetails.heightCentimeters)
  );
  const [validationState, setValidationState] = useState<ValidationState>({});

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
    setValidationState({});
  }, [isEditing, profileDetails]);

  function startEditing() {
    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
    setValidationState({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setNameInput(profileDetails.name);
    setDraftGender(profileDetails.gender);
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
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

  async function onSave() {
    if (isSubmitting) {
      return;
    }

    const nextValidationState: ValidationState = {};
    const trimmedName = nameInput.trim();
    const parsedHeightCentimeters = parsePositiveNumberInput(heightInput);

    if (trimmedName.length === 0) {
      nextValidationState.name = t('tabScreens.profile.validation.nameRequired');
    }

    if (parsedHeightCentimeters === null) {
      nextValidationState.height = t('tabScreens.profile.validation.heightRequired');
    } else if (parsedHeightCentimeters === undefined) {
      nextValidationState.height = t('tabScreens.profile.validation.heightInvalid');
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
    <View style={styles.form}>
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

      <View style={styles.field}>
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
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">
          {t('tabScreens.profile.sections.appearance')}
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
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">
          {t('tabScreens.profile.sections.language')}
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
      </View>

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

      {validationState.form ? (
        <ThemedText style={{ color: errorTextColor[theme] }}>{validationState.form}</ThemedText>
      ) : null}

      <View style={styles.actions}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    gap: 8,
  },
  form: {
    gap: 10,
  },
});
