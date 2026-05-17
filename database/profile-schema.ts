export const PROFILE_RECORD_ID = 1;

export const PROFILE_DETAILS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS profile_details (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    avatar_uri TEXT,
    name TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
    height_centimeters REAL CHECK (height_centimeters IS NULL OR height_centimeters > 0),
    birth_date TEXT
  );
`;

export const WEIGHT_HISTORY_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS weight_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight_kilograms REAL NOT NULL CHECK (weight_kilograms > 0),
    measured_at TEXT NOT NULL
  );
`;

export const WEIGHT_HISTORY_MEASURED_AT_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS weight_history_measured_at_idx
  ON weight_history (measured_at DESC, id DESC);
`;
