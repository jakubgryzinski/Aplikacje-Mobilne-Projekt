export type ProfileGender = 'male' | 'female';

export type ProfileDetails = {
  avatarUri: string | null;
  name: string;
  gender: ProfileGender;
  heightCentimeters: number | null;
  birthDate: string | null;
};

export type WeightHistoryEntry = {
  id: number;
  weightKilograms: number;
  measuredAt: string;
};

export type NewWeightHistoryEntry = {
  weightKilograms: number;
  measuredAt: string;
};

export type ProfileStateHydrationPayload = {
  profileDetails: ProfileDetails;
  weightHistoryEntries: WeightHistoryEntry[];
};

export const emptyProfileDetails: ProfileDetails = {
  avatarUri: null,
  name: '',
  gender: 'male',
  heightCentimeters: null,
  birthDate: null,
};
