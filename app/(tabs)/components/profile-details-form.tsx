import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProfileStore } from '@/store/profile-store';

import { OptionToggleGroup } from './option-toggle-group';
import { ProfileNumberField } from './profile-number-field';
import { ProfileTextField } from './profile-text-field';

function formatOptionalNumber(value: number | null): string {
  return value === null ? '' : String(value);
}

function parsePositiveNumberInput(value: string): number | null | undefined {
  const normalizedValue = value.replace(',', '.').trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  if (!/^\d+([.]\d+)?$/.test(normalizedValue)) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
}

export function ProfileDetailsForm() {
  const { t } = useTranslation();
  const profileDetails = useProfileStore((state) => state.profileDetails);
  const setGender = useProfileStore((state) => state.setGender);
  const setHeightCentimeters = useProfileStore((state) => state.setHeightCentimeters);
  const setName = useProfileStore((state) => state.setName);
  const [nameInput, setNameInput] = useState(profileDetails.name);
  const [heightInput, setHeightInput] = useState(formatOptionalNumber(profileDetails.heightCentimeters));
  const [currentWeightInput, setCurrentWeightInput] = useState('');

  useEffect(() => {
    setNameInput(profileDetails.name);
  }, [profileDetails.name]);

  useEffect(() => {
    setHeightInput(formatOptionalNumber(profileDetails.heightCentimeters));
  }, [profileDetails.heightCentimeters]);

  function onNameChange(value: string) {
    setNameInput(value);
    setName(value);
  }

  function onHeightChange(value: string) {
    setHeightInput(value);

    const parsedHeightCentimeters = parsePositiveNumberInput(value);

    if (parsedHeightCentimeters !== undefined) {
      setHeightCentimeters(parsedHeightCentimeters);
    }
  }

  return (
    <ThemedView style={styles.form}>
      <ProfileTextField
        accessibilityLabel={t('tabScreens.profile.fields.name')}
        label={t('tabScreens.profile.fields.name')}
        onChangeText={onNameChange}
        placeholder={t('tabScreens.profile.placeholders.name')}
        value={nameInput}
      />

      <ThemedView style={styles.field}>
        <ThemedText type="defaultSemiBold">{t('tabScreens.profile.fields.gender')}</ThemedText>
        <OptionToggleGroup
          accessibilityLabel={t('tabScreens.profile.fields.gender')}
          onChange={setGender}
          options={[
            { label: t('tabScreens.profile.gender.male'), value: 'male' },
            { label: t('tabScreens.profile.gender.female'), value: 'female' },
          ]}
          selectedValue={profileDetails.gender}
        />
      </ThemedView>

      <ProfileNumberField
        accessibilityLabel={t('tabScreens.profile.fields.height')}
        label={t('tabScreens.profile.fields.height')}
        onChangeText={onHeightChange}
        placeholder={t('tabScreens.profile.placeholders.height')}
        unitLabel={t('tabScreens.profile.units.centimeters')}
        value={heightInput}
      />

      <ProfileNumberField
        accessibilityLabel={t('tabScreens.profile.fields.currentWeight')}
        label={t('tabScreens.profile.fields.currentWeight')}
        onChangeText={setCurrentWeightInput}
        placeholder={t('tabScreens.profile.placeholders.currentWeight')}
        unitLabel={t('tabScreens.profile.units.kilograms')}
        value={currentWeightInput}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  field: {
    gap: 8,
  },
});
