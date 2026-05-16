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
