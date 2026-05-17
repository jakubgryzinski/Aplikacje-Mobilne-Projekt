import {
  PROFILE_DETAILS_TABLE_SQL,
  PROFILE_RECORD_ID,
  WEIGHT_HISTORY_MEASURED_AT_INDEX_SQL,
  WEIGHT_HISTORY_TABLE_SQL,
} from '@/database/profile-schema';
import { getDatabase } from '@/database/sqlite';
import {
  emptyProfileDetails,
  type NewWeightHistoryEntry,
  type ProfileDetails,
  type ProfileGender,
  type WeightHistoryEntry,
} from '@/store/profile-types';

type RawProfileDetailsRow = {
  avatar_uri: string | null;
  name: string | null;
  gender: string | null;
  height_centimeters: number | null;
};

type RawWeightHistoryEntryRow = {
  id: number;
  weight_kilograms: number;
  measured_at: string;
};

function isProfileGender(value: string | null): value is ProfileGender {
  return value === 'male' || value === 'female';
}

function normalizeProfileDetails(row: RawProfileDetailsRow | null): ProfileDetails {
  if (!row) {
    return emptyProfileDetails;
  }

  return {
    avatarUri: row.avatar_uri ?? emptyProfileDetails.avatarUri,
    name: row.name ?? emptyProfileDetails.name,
    gender: isProfileGender(row.gender) ? row.gender : emptyProfileDetails.gender,
    heightCentimeters: row.height_centimeters ?? emptyProfileDetails.heightCentimeters,
  };
}

function normalizeMeasuredAt(measuredAt: string): string {
  const timestamp = new Date(measuredAt);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error('Invalid weight measurement timestamp.');
  }

  return timestamp.toISOString();
}

function normalizeWeightKilograms(weightKilograms: number): number {
  if (!Number.isFinite(weightKilograms) || weightKilograms <= 0) {
    throw new Error('Weight must be a positive number.');
  }

  return weightKilograms;
}

function normalizeHeightCentimeters(heightCentimeters: number | null): number | null {
  if (heightCentimeters === null) {
    return null;
  }

  if (!Number.isFinite(heightCentimeters) || heightCentimeters <= 0) {
    throw new Error('Height must be a positive number.');
  }

  return heightCentimeters;
}

function normalizeWeightHistoryEntry(row: RawWeightHistoryEntryRow): WeightHistoryEntry {
  return {
    id: row.id,
    weightKilograms: row.weight_kilograms,
    measuredAt: normalizeMeasuredAt(row.measured_at),
  };
}

export async function initializeProfileStorage() {
  const database = await getDatabase();

  await database.execAsync(PROFILE_DETAILS_TABLE_SQL);
  await database.execAsync(WEIGHT_HISTORY_TABLE_SQL);
  await database.execAsync(WEIGHT_HISTORY_MEASURED_AT_INDEX_SQL);
  await database.runAsync(`INSERT OR IGNORE INTO profile_details (id) VALUES (?);`, PROFILE_RECORD_ID);
  await database.runAsync(
    `UPDATE profile_details
     SET gender = ?
     WHERE id = ? AND gender IS NULL;`,
    emptyProfileDetails.gender,
    PROFILE_RECORD_ID
  );
}

export async function loadProfileDetails(): Promise<ProfileDetails> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<RawProfileDetailsRow>(
    `SELECT avatar_uri, name, gender, height_centimeters
     FROM profile_details
     WHERE id = ?;`,
    PROFILE_RECORD_ID
  );

  return normalizeProfileDetails(row);
}

export async function saveProfileDetails(profileDetails: ProfileDetails): Promise<ProfileDetails> {
  const database = await getDatabase();
  const normalizedProfileDetails: ProfileDetails = {
    avatarUri: profileDetails.avatarUri,
    name: profileDetails.name,
    gender: isProfileGender(profileDetails.gender)
      ? profileDetails.gender
      : emptyProfileDetails.gender,
    heightCentimeters: normalizeHeightCentimeters(profileDetails.heightCentimeters),
  };

  await database.runAsync(
    `INSERT INTO profile_details (id, avatar_uri, name, gender, height_centimeters)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       avatar_uri = excluded.avatar_uri,
       name = excluded.name,
       gender = excluded.gender,
       height_centimeters = excluded.height_centimeters;`,
    PROFILE_RECORD_ID,
    normalizedProfileDetails.avatarUri,
    normalizedProfileDetails.name,
    normalizedProfileDetails.gender,
    normalizedProfileDetails.heightCentimeters
  );

  return normalizedProfileDetails;
}

export async function listWeightHistoryEntries(): Promise<WeightHistoryEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<RawWeightHistoryEntryRow>(
    `SELECT id, weight_kilograms, measured_at
     FROM weight_history
     ORDER BY measured_at DESC, id DESC;`
  );

  return rows.map(normalizeWeightHistoryEntry);
}

export async function createWeightHistoryEntry(
  entry: NewWeightHistoryEntry
): Promise<WeightHistoryEntry> {
  const database = await getDatabase();
  const normalizedWeightKilograms = normalizeWeightKilograms(entry.weightKilograms);
  const normalizedMeasuredAt = normalizeMeasuredAt(entry.measuredAt);
  const result = await database.runAsync(
    `INSERT INTO weight_history (weight_kilograms, measured_at) VALUES (?, ?);`,
    normalizedWeightKilograms,
    normalizedMeasuredAt
  );

  return {
    id: result.lastInsertRowId,
    weightKilograms: normalizedWeightKilograms,
    measuredAt: normalizedMeasuredAt,
  };
}

export async function updateWeightHistoryEntry(
  id: number,
  entry: NewWeightHistoryEntry
): Promise<WeightHistoryEntry> {
  const database = await getDatabase();
  const normalizedWeightKilograms = normalizeWeightKilograms(entry.weightKilograms);
  const normalizedMeasuredAt = normalizeMeasuredAt(entry.measuredAt);
  const result = await database.runAsync(
    `UPDATE weight_history
     SET weight_kilograms = ?, measured_at = ?
     WHERE id = ?;`,
    normalizedWeightKilograms,
    normalizedMeasuredAt,
    id
  );

  if (result.changes === 0) {
    throw new Error(`Weight history entry ${id} does not exist.`);
  }

  return {
    id,
    weightKilograms: normalizedWeightKilograms,
    measuredAt: normalizedMeasuredAt,
  };
}

export async function deleteWeightHistoryEntry(id: number): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(`DELETE FROM weight_history WHERE id = ?;`, id);
}
