import { z } from 'zod';

import type { ProfileDetails } from '@/store/profile-types';

import { formatOptionalNumber, parsePositiveNumberInput } from './profile-form-utils';

export const profileDetailsFormSchema = z.object({
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
});

export type ProfileDetailsFormValues = z.infer<typeof profileDetailsFormSchema>;

export function getProfileDetailsFormValues(
  profileDetails: ProfileDetails
): ProfileDetailsFormValues {
  return {
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
    gender: formValues.gender,
    heightCentimeters: parsePositiveNumberInput(formValues.height) ?? null,
    name: formValues.name.trim(),
  };
}
