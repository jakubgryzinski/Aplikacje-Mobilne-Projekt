import type { WeightHistoryEntry } from '@/store/profile-types';

import { sortWeightHistoryEntriesChronologically } from './profile-chart-utils';
import { formatMeasurementDateForDisplay } from './profile-form-utils';

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obesity';

export type BmiChartGuideLine = {
  label: string;
  y: number;
};

export type BmiChartPoint = WeightHistoryEntry & {
  bmiCategory: BmiCategory;
  bmiLabel: string;
  bmiValue: number;
  dateLabel: string;
  isLabelVisible: boolean;
  x: number;
  y: number;
};

type BuildBmiChartModelParams = {
  birthDate: string;
  chartHeight: number;
  chartWidth: number;
  currentDate?: Date;
  entries: WeightHistoryEntry[];
  guideLineCount: number;
  heightCentimeters: number;
  locale: string;
  plotBottom: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
};

export type BmiChartModel = {
  guideLines: BmiChartGuideLine[];
  isAdult: boolean;
  latestPoint: BmiChartPoint | null;
  linePath: string;
  points: BmiChartPoint[];
};

export const buildBmiChartModel = (params: BuildBmiChartModelParams): BmiChartModel => {
  const {
    birthDate,
    chartHeight,
    chartWidth,
    currentDate = new Date(),
    entries,
    guideLineCount,
    heightCentimeters,
    locale,
    plotBottom,
    plotLeft,
    plotRight,
    plotTop,
  } = params;
  const isAdult = isAdultByBirthDate(birthDate, currentDate);

  if (!isAdult) {
    return {
      guideLines: [],
      isAdult: false,
      latestPoint: null,
      linePath: '',
      points: [],
    };
  }

  const adultWeightEntries = getAdultWeightHistoryEntries(entries, birthDate);

  if (adultWeightEntries.length === 0) {
    return {
      guideLines: [],
      isAdult: true,
      latestPoint: null,
      linePath: '',
      points: [],
    };
  }

  const bmiFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });
  const bmiDomain = getBmiDomain(adultWeightEntries, heightCentimeters);
  const plotHeight = Math.max(chartHeight - plotTop - plotBottom, 1);
  const plotWidth = Math.max(chartWidth - plotLeft - plotRight, 1);
  const points = adultWeightEntries.map((entry, index) => {
    const bmiValue = calculateBmi(entry.weightKilograms, heightCentimeters);
    const x =
      adultWeightEntries.length === 1
        ? plotLeft + plotWidth / 2
        : plotLeft + (index / (adultWeightEntries.length - 1)) * plotWidth;
    const bmiRatio =
      bmiDomain.max === bmiDomain.min
        ? 0.5
        : (bmiValue - bmiDomain.min) / (bmiDomain.max - bmiDomain.min);
    const y = plotTop + plotHeight - bmiRatio * plotHeight;

    return {
      ...entry,
      bmiCategory: getBmiCategory(bmiValue),
      bmiLabel: bmiFormatter.format(bmiValue),
      bmiValue,
      dateLabel: formatMeasurementDateForDisplay(entry.measuredAt, locale),
      isLabelVisible: shouldShowDateLabel(index, adultWeightEntries.length),
      x,
      y,
    };
  });

  return {
    guideLines: createGuideLines({
      formatter: bmiFormatter,
      guideLineCount,
      maxBmi: bmiDomain.max,
      minBmi: bmiDomain.min,
      plotHeight,
      plotTop,
    }),
    isAdult: true,
    latestPoint: points.at(-1) ?? null,
    linePath: buildLinePath(points),
    points,
  };
};

export const isAdultByBirthDate = (
  birthDate: string,
  currentDate: Date = new Date()
): boolean => {
  const adultStartDateValue = getAdultStartDateValue(birthDate);

  if (adultStartDateValue === null) {
    return false;
  }

  return getUtcDateValueFromDate(currentDate) >= adultStartDateValue;
};

export const getAdultWeightHistoryEntries = (
  entries: WeightHistoryEntry[],
  birthDate: string
) => {
  const adultStartDateValue = getAdultStartDateValue(birthDate);

  if (adultStartDateValue === null) {
    return [];
  }

  return sortWeightHistoryEntriesChronologically(entries).filter((entry) => {
    const measurementDateValue = getUtcDateValueFromIso(entry.measuredAt);

    if (measurementDateValue === null) {
      return false;
    }

    return measurementDateValue >= adultStartDateValue;
  });
};

export const getBmiCategory = (bmiValue: number): BmiCategory => {
  if (bmiValue < 18.5) {
    return 'underweight';
  }

  if (bmiValue < 25) {
    return 'healthy';
  }

  if (bmiValue < 30) {
    return 'overweight';
  }

  return 'obesity';
};

const calculateBmi = (weightKilograms: number, heightCentimeters: number): number => {
  const heightMeters = heightCentimeters / 100;

  return weightKilograms / (heightMeters * heightMeters);
};

const buildLinePath = (points: BmiChartPoint[]) => {
  if (points.length < 2) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
};

const createGuideLines = (params: {
  formatter: Intl.NumberFormat;
  guideLineCount: number;
  maxBmi: number;
  minBmi: number;
  plotHeight: number;
  plotTop: number;
}) => {
  const {
    formatter,
    guideLineCount,
    maxBmi,
    minBmi,
    plotHeight,
    plotTop,
  } = params;

  if (guideLineCount < 2) {
    return [];
  }

  return Array.from({ length: guideLineCount }, (_, index) => {
    const ratio = index / (guideLineCount - 1);
    const lineBmi = maxBmi - (maxBmi - minBmi) * ratio;

    return {
      label: formatter.format(lineBmi),
      y: plotTop + plotHeight * ratio,
    };
  });
};

const getBmiDomain = (entries: WeightHistoryEntry[], heightCentimeters: number) => {
  const bmiValues = entries.map((entry) => calculateBmi(entry.weightKilograms, heightCentimeters));
  const rawMin = Math.min(...bmiValues);
  const rawMax = Math.max(...bmiValues);

  if (rawMin === rawMax) {
    const padding = Math.max(rawMin * 0.05, 1);

    return {
      max: rawMax + padding,
      min: Math.max(rawMin - padding, 0),
    };
  }

  const spread = rawMax - rawMin;
  const padding = Math.max(spread * 0.1, 0.5);

  return {
    max: rawMax + padding,
    min: Math.max(rawMin - padding, 0),
  };
};

const getAdultStartDateValue = (birthDate: string): number | null => {
  const parsedBirthDate = new Date(birthDate);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    return null;
  }

  return Date.UTC(
    parsedBirthDate.getUTCFullYear() + 18,
    parsedBirthDate.getUTCMonth(),
    parsedBirthDate.getUTCDate()
  );
};

const getUtcDateValueFromDate = (date: Date): number => {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const getUtcDateValueFromIso = (value: string): number | null => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return Date.UTC(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate()
  );
};

const shouldShowDateLabel = (index: number, entryCount: number) => {
  if (entryCount <= 4) {
    return true;
  }

  if (index === 0 || index === entryCount - 1) {
    return true;
  }

  const labelStep = Math.ceil(entryCount / 4);

  return index % labelStep === 0;
};
