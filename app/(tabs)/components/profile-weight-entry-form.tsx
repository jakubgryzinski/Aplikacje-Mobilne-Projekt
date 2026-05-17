import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { createProfileWeightEntry } from '@/store/profile-actions';

import { ProfileActionButton } from './profile-action-button';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';
import {
  getDefaultProfileWeightEntryFormValues,
  getProfileWeightEntryFromFormValues,
  type ProfileWeightEntryFormValues,
  profileWeightEntryFormSchema,
} from './profile-weight-entry-form.schema';
import { createZodFormResolver } from './zod-form-resolver';

export function ProfileWeightEntryForm() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const [formError, setFormError] = useState<string | undefined>();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<ProfileWeightEntryFormValues>({
    defaultValues: getDefaultProfileWeightEntryFormValues(),
    resolver: createZodFormResolver(profileWeightEntryFormSchema),
  });

  const onSave = handleSubmit(async (formValues) => {
    try {
      setFormError(undefined);
      await createProfileWeightEntry(getProfileWeightEntryFromFormValues(formValues));
      reset(getDefaultProfileWeightEntryFormValues());
    } catch {
      setFormError(t('tabs.profile.weight.entry.saveError'));
    }
  });

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
        <ThemedText type="subtitle">{t('tabs.profile.weight.entry.title')}</ThemedText>
      </View>

      <Controller
        control={control}
        name="measurementDate"
        render={({ field }) => (
          <ProfileTextField
            accessibilityLabel={t('tabs.profile.weight.measurementDate.label')}
            editable={!isSubmitting}
            errorMessage={
              errors.measurementDate?.message ? t(errors.measurementDate.message) : undefined
            }
            keyboardType="numbers-and-punctuation"
            label={t('tabs.profile.weight.measurementDate.label')}
            onBlur={field.onBlur}
            onChangeText={(textValue) => {
              if (formError) {
                setFormError(undefined);
              }

              field.onChange(textValue);
            }}
            placeholder={t('tabs.profile.weight.measurementDate.placeholder')}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="weight"
        render={({ field }) => (
          <ProfileNumberField
            accessibilityLabel={t('tabs.profile.weight.value.label')}
            editable={!isSubmitting}
            errorMessage={errors.weight?.message ? t(errors.weight.message) : undefined}
            label={t('tabs.profile.weight.value.label')}
            onBlur={field.onBlur}
            onChangeText={(textValue) => {
              if (formError) {
                setFormError(undefined);
              }

              field.onChange(textValue);
            }}
            placeholder={t('tabs.profile.weight.value.placeholder')}
            unitLabel={t('tabs.profile.weight.unit')}
            value={field.value}
          />
        )}
      />

      {formError ? (
        <ThemedText style={{ color: palette.errorText }}>{formError}</ThemedText>
      ) : null}

      <View style={styles.actions}>
        <ProfileActionButton
          disabled={isSubmitting}
          isPrimary
          label={t('tabs.profile.weight.entry.submit')}
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
