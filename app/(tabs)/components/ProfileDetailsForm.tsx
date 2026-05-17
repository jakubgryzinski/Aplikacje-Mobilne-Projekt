import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { updateLanguagePreference, updateThemePreference } from '@/store/app-settings-actions';
import { useAppSettingsStore } from '@/store/app-settings';
import { saveProfileIdentity } from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';
import type { ProfileGender } from '@/store/profile-types';

import { OptionToggleGroup } from './OptionToggleGroup';
import { ProfileActionButton } from './ProfileActionButton';
import {
  getProfileDetailsFormValues,
  getProfileDetailsFromFormValues,
  type ProfileDetailsFormValues,
  profileDetailsFormSchema,
} from './profile-details-form.schema';
import { ProfileNumberField } from './ProfileNumberField';
import { ProfileTextField } from './ProfileTextField';
import { createZodFormResolver } from './zod-form-resolver';

export function ProfileDetailsForm() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const profileDetails = useProfileStore((state) => state.profileDetails);
  const themePreference = useAppSettingsStore((state) => state.themePreference);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [isSavingGender, setIsSavingGender] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit: onSubmit,
    reset,
  } = useForm<ProfileDetailsFormValues>({
    defaultValues: getProfileDetailsFormValues(profileDetails),
    resolver: createZodFormResolver(profileDetailsFormSchema),
  });

  useEffect(() => {
    if (isEditing) {
      return;
    }

    reset(getProfileDetailsFormValues(profileDetails));
    setFormError(undefined);
  }, [isEditing, profileDetails, reset]);

  const startEditing = () => {
    reset(getProfileDetailsFormValues(profileDetails));
    setFormError(undefined);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset(getProfileDetailsFormValues(profileDetails));
    setFormError(undefined);
    setIsEditing(false);
  };

  const onSave = onSubmit(async (formValues) => {
    try {
      setFormError(undefined);
      await saveProfileIdentity(
        getProfileDetailsFromFormValues(formValues, profileDetails.avatarUri)
      );
      setIsEditing(false);
    } catch {
      setFormError(t('tabScreens.profile.form.saveError'));
    }
  });

  const onGenderChange = async (gender: ProfileGender) => {
    if (gender === profileDetails.gender || isSavingGender) {
      return;
    }

    try {
      setFormError(undefined);
      setIsSavingGender(true);
      await saveProfileIdentity({
        ...profileDetails,
        gender,
      });
    } catch {
      setFormError(t('tabScreens.profile.form.saveError'));
    } finally {
      setIsSavingGender(false);
    }
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <ProfileTextField
            accessibilityLabel={t('tabScreens.profile.fields.name')}
            editable={isEditing}
            errorMessage={errors.name?.message ? t(errors.name.message) : undefined}
            label={t('tabScreens.profile.fields.name')}
            onBlur={field.onBlur}
            onChangeText={(textValue) => {
              if (formError) {
                setFormError(undefined);
              }

              field.onChange(textValue);
            }}
            placeholder={t('tabScreens.profile.placeholders.name')}
            value={field.value}
          />
        )}
      />

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">{t('tabScreens.profile.fields.gender')}</ThemedText>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <OptionToggleGroup
              accessibilityLabel={t('tabScreens.profile.fields.gender')}
              disabled={isSubmitting || isSavingGender}
              onChange={(gender) => {
                if (formError) {
                  setFormError(undefined);
                }

                field.onChange(gender);
                void onGenderChange(gender);
              }}
              options={[
                { label: t('tabScreens.profile.gender.male'), value: 'male' },
                { label: t('tabScreens.profile.gender.female'), value: 'female' },
              ]}
              selectedValue={field.value}
            />
          )}
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

      <Controller
        control={control}
        name="height"
        render={({ field }) => (
          <ProfileNumberField
            accessibilityLabel={t('tabScreens.profile.fields.height')}
            editable={isEditing}
            errorMessage={errors.height?.message ? t(errors.height.message) : undefined}
            label={t('tabScreens.profile.fields.height')}
            onBlur={field.onBlur}
            onChangeText={(textValue) => {
              if (formError) {
                setFormError(undefined);
              }

              field.onChange(textValue);
            }}
            placeholder={t('tabScreens.profile.placeholders.height')}
            unitLabel={t('tabScreens.profile.units.centimeters')}
            value={field.value}
          />
        )}
      />

      {formError ? (
        <ThemedText style={{ color: palette.errorText }}>{formError}</ThemedText>
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
