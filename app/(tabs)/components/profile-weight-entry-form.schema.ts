import { z } from 'zod';

import type { NewWeightHistoryEntry } from '@/store/profile-types';

import {
  getTodayDateInput,
  parseDateInput,
  parsePositiveNumberInput,
} from './profile-form-utils';

const measurementDateSchema = z.string().superRefine((value, context) => {
  if (value.trim().length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'tabs.profile.weight.measurementDate.required',
    });

    return;
  }

  if (!parseDateInput(value)) {
    context.addIssue({
      code: 'custom',
      message: 'tabs.profile.weight.measurementDate.invalid',
    });
  }
});

const weightValueSchema = z.string().superRefine((value, context) => {
  const parsedWeightKilograms = parsePositiveNumberInput(value);

  if (parsedWeightKilograms === null) {
    context.addIssue({
      code: 'custom',
      message: 'tabs.profile.weight.value.required',
    });

    return;
  }

  if (parsedWeightKilograms === undefined) {
    context.addIssue({
      code: 'custom',
      message: 'tabs.profile.weight.value.invalid',
    });
  }
});

export const profileWeightEntryFormSchema = z.object({
  measurementDate: measurementDateSchema,
  weight: weightValueSchema,
});

export type ProfileWeightEntryFormValues = z.infer<typeof profileWeightEntryFormSchema>;

export function getDefaultProfileWeightEntryFormValues(): ProfileWeightEntryFormValues {
  return {
    measurementDate: getTodayDateInput(),
    weight: '',
  };
}

export function getProfileWeightEntryFromFormValues(
  formValues: ProfileWeightEntryFormValues
): NewWeightHistoryEntry {
  return {
    measuredAt: parseDateInput(formValues.measurementDate) ?? '',
    weightKilograms: parsePositiveNumberInput(formValues.weight) ?? 0,
  };
}
