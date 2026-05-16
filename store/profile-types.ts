export type ProfileGender = 'male' | 'female';

export type ProfileDetails = {
  avatarUri: string | null;
  name: string;
  gender: ProfileGender | null;
  heightCentimeters: number | null;
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

export const emptyProfileDetails: ProfileDetails = {
  avatarUri: null,
  name: '',
  gender: null,
  heightCentimeters: null,
};
