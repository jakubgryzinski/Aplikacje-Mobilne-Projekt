import { create } from 'zustand';

import {
  emptyProfileDetails,
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
  setWeightHistoryEntries: (weightHistoryEntries) =>
    set({
      weightHistoryEntries,
    }),
}));
