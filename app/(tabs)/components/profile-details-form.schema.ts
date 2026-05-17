import { z } from 'zod';

import type { ProfileDetails } from '@/store/profile-types';

import {
  formatDateInputFromIso,
  formatOptionalNumber,
  isIsoDateInFuture,
  parseDateInput,
  parsePositiveNumberInput,
} from './profile-form-utils';

export const profileDetailsFormSchema = z.object({
  birthDate: z.string(),
  gender: z.enum(['male', 'female']),
  height: z.string(),
  name: z.string(),
}).superRefine((formValues, context) => {
  if (formValues.name.trim().length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'tabScreens.profile.validation.nameRequired',
      path: ['name'],
    });
  }

  const parsedHeightCentimeters = parsePositiveNumberInput(formValues.height);

  if (parsedHeightCentimeters === null) {
    context.addIssue({
      code: 'custom',
      message: 'tabScreens.profile.validation.heightRequired',
      path: ['height'],
    });
  } else if (parsedHeightCentimeters === undefined) {
    context.addIssue({
      code: 'custom',
      message: 'tabScreens.profile.validation.heightInvalid',
      path: ['height'],
    });
  }

  if (formValues.birthDate.trim().length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'tabScreens.profile.validation.birthDateRequired',
      path: ['birthDate'],
    });

    return;
  }

  const parsedBirthDate = parseDateInput(formValues.birthDate);

  if (!parsedBirthDate || isIsoDateInFuture(parsedBirthDate)) {
    context.addIssue({
      code: 'custom',
      message: 'tabScreens.profile.validation.birthDateInvalid',
      path: ['birthDate'],
    });
  }
});

export type ProfileDetailsFormValues = z.infer<typeof profileDetailsFormSchema>;

export function getProfileDetailsFormValues(
  profileDetails: ProfileDetails
): ProfileDetailsFormValues {
  return {
    birthDate: profileDetails.birthDate
      ? formatDateInputFromIso(profileDetails.birthDate)
      : '',
    gender: profileDetails.gender,
    height: formatOptionalNumber(profileDetails.heightCentimeters),
    name: profileDetails.name,
  };
}

export function getProfileDetailsFromFormValues(
  formValues: ProfileDetailsFormValues,
  avatarUri: string | null
): ProfileDetails {
  return {
    avatarUri,
    birthDate: parseDateInput(formValues.birthDate) ?? null,
    gender: formValues.gender,
    heightCentimeters: parsePositiveNumberInput(formValues.height) ?? null,
    name: formValues.name.trim(),
  };
}
