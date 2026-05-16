import * as ImagePicker from 'expo-image-picker';

import {
  createWeightHistoryEntry,
  deleteWeightHistoryEntry,
  initializeProfileStorage,
  listWeightHistoryEntries,
  loadProfileDetails,
  saveProfileDetails,
  updateWeightHistoryEntry,
} from '@/database/profile-repository';
import {
  emptyProfileDetails,
  type NewWeightHistoryEntry,
  type ProfileDetails,
  type WeightHistoryEntry,
} from '@/store/profile-types';
import { useProfileStore } from '@/store/profile-store';

export type ProfileAvatarErrorCode = 'permission-denied' | 'picker-failed';

export type ProfileAvatarError = Error & {
  code: ProfileAvatarErrorCode;
};

function createProfileAvatarError(
  code: ProfileAvatarErrorCode,
  message: string
): ProfileAvatarError {
  return Object.assign(new Error(message), { code });
}

export function isProfileAvatarError(error: unknown): error is ProfileAvatarError {
  return (
    error instanceof Error &&
    'code' in error &&
    (error.code === 'permission-denied' || error.code === 'picker-failed')
  );
}

function sortWeightHistoryEntries(
  weightHistoryEntries: WeightHistoryEntry[]
): WeightHistoryEntry[] {
  return [...weightHistoryEntries].sort((leftEntry, rightEntry) => {
    const measuredAtDifference =
      new Date(rightEntry.measuredAt).getTime() - new Date(leftEntry.measuredAt).getTime();

    if (measuredAtDifference !== 0) {
      return measuredAtDifference;
    }

    return rightEntry.id - leftEntry.id;
  });
}

export async function hydrateProfileState() {
  const profileStore = useProfileStore.getState();

  profileStore.startHydration();

  try {
    await initializeProfileStorage();

    const [profileDetails, weightHistoryEntries] = await Promise.all([
      loadProfileDetails(),
      listWeightHistoryEntries(),
    ]);

    useProfileStore.getState().hydrateProfile({
      profileDetails,
      weightHistoryEntries: sortWeightHistoryEntries(weightHistoryEntries),
    });
  } catch (error) {
    useProfileStore.getState().hydrateProfile({
      profileDetails: emptyProfileDetails,
      weightHistoryEntries: [],
    });
    console.error('Failed to initialize profile state.', error);
  } finally {
    useProfileStore.getState().finishHydration();
  }
}

export async function pickProfileAvatar(): Promise<string | null> {
  try {
    const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResponse.granted) {
      throw createProfileAvatarError(
        'permission-denied',
        'Media library permission is required to choose a profile photo.'
      );
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (pickerResult.canceled) {
      return null;
    }

    const selectedAsset = pickerResult.assets[0];

    if (!selectedAsset?.uri) {
      throw createProfileAvatarError('picker-failed', 'Selected image is missing a URI.');
    }

    return selectedAsset.uri;
  } catch (error) {
    if (isProfileAvatarError(error)) {
      throw error;
    }

    console.error('Failed to pick profile avatar.', error);
    throw createProfileAvatarError(
      'picker-failed',
      'Unable to open the image picker for the profile avatar.'
    );
  }
}

export async function saveProfileIdentity(profileDetails: ProfileDetails) {
  try {
    const savedProfileDetails = await saveProfileDetails(profileDetails);

    useProfileStore.getState().hydrateProfile({
      profileDetails: savedProfileDetails,
      weightHistoryEntries: useProfileStore.getState().weightHistoryEntries,
    });
  } catch (error) {
    console.error('Failed to save profile details.', error);
    throw error;
  }
}

export async function saveProfileAvatar(avatarUri: string | null) {
  try {
    const profileStore = useProfileStore.getState();
    const savedProfileDetails = await saveProfileDetails({
      ...profileStore.profileDetails,
      avatarUri,
    });

    useProfileStore.getState().hydrateProfile({
      profileDetails: savedProfileDetails,
      weightHistoryEntries: profileStore.weightHistoryEntries,
    });
  } catch (error) {
    console.error('Failed to save profile avatar.', error);
    throw error;
  }
}

export async function createProfileWeightEntry(entry: NewWeightHistoryEntry) {
  try {
    const savedWeightHistoryEntry = await createWeightHistoryEntry(entry);
    const profileStore = useProfileStore.getState();

    profileStore.setWeightHistoryEntries(
      sortWeightHistoryEntries([
        ...profileStore.weightHistoryEntries,
        savedWeightHistoryEntry,
      ])
    );

    return savedWeightHistoryEntry;
  } catch (error) {
    console.error('Failed to create weight history entry.', error);
    throw error;
  }
}

export async function updateProfileWeightEntry(id: number, entry: NewWeightHistoryEntry) {
  try {
    const savedWeightHistoryEntry = await updateWeightHistoryEntry(id, entry);
    const profileStore = useProfileStore.getState();

    profileStore.setWeightHistoryEntries(
      sortWeightHistoryEntries(
        profileStore.weightHistoryEntries.map((weightHistoryEntry) =>
          weightHistoryEntry.id === id ? savedWeightHistoryEntry : weightHistoryEntry
        )
      )
    );

    return savedWeightHistoryEntry;
  } catch (error) {
    console.error(`Failed to update weight history entry ${id}.`, error);
    throw error;
  }
}

export async function deleteProfileWeightEntry(id: number) {
  try {
    await deleteWeightHistoryEntry(id);

    useProfileStore
      .getState()
      .setWeightHistoryEntries(
        useProfileStore
          .getState()
          .weightHistoryEntries.filter((weightHistoryEntry) => weightHistoryEntry.id !== id)
      );
  } catch (error) {
    console.error(`Failed to delete weight history entry ${id}.`, error);
    throw error;
  }
}
