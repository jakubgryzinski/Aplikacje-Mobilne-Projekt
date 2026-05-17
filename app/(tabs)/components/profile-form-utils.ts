export const formatOptionalNumber = (value: number | null): string =>
  value === null ? '' : String(value);

export const parsePositiveNumberInput = (
  value: string
): number | null | undefined => {
  const normalizedValue = value.replace(',', '.').trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  if (!/^\d+([.]\d+)?$/.test(normalizedValue)) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
};

export const getTodayDateInput = (): string => {
  const today = new Date();

  return formatDateParts(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
};

export const formatDateInputFromIso = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return formatDateParts(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth() + 1,
    parsedDate.getUTCDate()
  );
};

export const parseMeasurementDateInput = (value: string): string | undefined => {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day, 12, 0, 0, 0);
  const parsedDate = new Date(timestamp);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return undefined;
  }

  return parsedDate.toISOString();
};

export const formatMeasurementDateForDisplay = (
  value: string,
  locale: string
): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(parsedDate);
};

const formatDateParts = (year: number, month: number, day: number): string => {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
