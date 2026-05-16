import { create } from 'zustand';

import {
  emptyProfileDetails,
  type ProfileGender,
  type ProfileDetails,
  type ProfileStateHydrationPayload,
  type WeightHistoryEntry,
} from '@/store/profile-types';

type ProfileStoreState = {
  isHydrated: boolean;
  isHydrating: boolean;
  profileDetails: ProfileDetails;
  weightHistoryEntries: WeightHistoryEntry[];
  hydrateProfile: (payload: ProfileStateHydrationPayload) => void;
  startHydration: () => void;
  finishHydration: () => void;
  setAvatarUri: (avatarUri: string | null) => void;
  setName: (name: string) => void;
  setGender: (gender: ProfileGender | null) => void;
  setHeightCentimeters: (heightCentimeters: number | null) => void;
  setWeightHistoryEntries: (weightHistoryEntries: WeightHistoryEntry[]) => void;
};

const initialProfileState = {
  isHydrated: false,
  isHydrating: false,
  profileDetails: emptyProfileDetails,
  weightHistoryEntries: [],
} satisfies Pick<
  ProfileStoreState,
  'isHydrated' | 'isHydrating' | 'profileDetails' | 'weightHistoryEntries'
>;

export const useProfileStore = create<ProfileStoreState>((set) => ({
  ...initialProfileState,
  hydrateProfile: ({ profileDetails, weightHistoryEntries }) =>
    set({
      profileDetails,
      weightHistoryEntries,
    }),
  startHydration: () =>
    set({
      isHydrating: true,
    }),
  finishHydration: () =>
    set({
      isHydrated: true,
      isHydrating: false,
    }),
  setAvatarUri: (avatarUri) =>
    set((state) => ({
      profileDetails: {
        ...state.profileDetails,
        avatarUri,
      },
    })),
  setName: (name) =>
    set((state) => ({
      profileDetails: {
        ...state.profileDetails,
        name,
      },
    })),
  setGender: (gender) =>
    set((state) => ({
      profileDetails: {
        ...state.profileDetails,
        gender,
      },
    })),
  setHeightCentimeters: (heightCentimeters) =>
    set((state) => ({
      profileDetails: {
        ...state.profileDetails,
        heightCentimeters,
      },
    })),
  setWeightHistoryEntries: (weightHistoryEntries) =>
    set({
      weightHistoryEntries,
    }),
}));
