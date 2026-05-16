import type { WeightHistoryEntry } from '@/store/profile-types';

import { formatMeasurementDateForDisplay } from './profile-form-utils';

export type WeightChartGuideLine = {
  label: string;
  y: number;
};

export type WeightChartPoint = WeightHistoryEntry & {
  dateLabel: string;
  isLabelVisible: boolean;
  weightLabel: string;
  x: number;
  y: number;
};

type BuildWeightChartModelParams = {
  chartHeight: number;
  chartWidth: number;
  entries: WeightHistoryEntry[];
  guideLineCount: number;
  locale: string;
  plotBottom: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
};

export type WeightChartModel = {
  guideLines: WeightChartGuideLine[];
  latestPoint: WeightChartPoint | null;
  linePath: string;
  points: WeightChartPoint[];
};

export function buildWeightChartModel({
  chartHeight,
  chartWidth,
  entries,
  guideLineCount,
  locale,
  plotBottom,
  plotLeft,
  plotRight,
  plotTop,
}: BuildWeightChartModelParams): WeightChartModel {
  const chronologicalEntries = sortWeightHistoryEntriesChronologically(entries);

  if (chronologicalEntries.length === 0) {
    return {
      guideLines: [],
      latestPoint: null,
      linePath: '',
      points: [],
    };
  }

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });
  const weightDomain = getWeightDomain(chronologicalEntries);
  const plotHeight = Math.max(chartHeight - plotTop - plotBottom, 1);
  const plotWidth = Math.max(chartWidth - plotLeft - plotRight, 1);
  const points = chronologicalEntries.map((entry, index) => {
    const x =
      chronologicalEntries.length === 1
        ? plotLeft + plotWidth / 2
        : plotLeft + (index / (chronologicalEntries.length - 1)) * plotWidth;
    const weightRatio =
      weightDomain.max === weightDomain.min
        ? 0.5
        : (entry.weightKilograms - weightDomain.min) / (weightDomain.max - weightDomain.min);
    const y = plotTop + plotHeight - weightRatio * plotHeight;

    return {
      ...entry,
      dateLabel: formatMeasurementDateForDisplay(entry.measuredAt, locale),
      isLabelVisible: shouldShowDateLabel(index, chronologicalEntries.length),
      weightLabel: `${formatter.format(entry.weightKilograms)}`,
      x,
      y,
    };
  });

  const guideLines = createGuideLines({
    formatter,
    guideLineCount,
    maxWeight: weightDomain.max,
    minWeight: weightDomain.min,
    plotHeight,
    plotTop,
  });

  return {
    guideLines,
    latestPoint: points.at(-1) ?? null,
    linePath: buildLinePath(points),
    points,
  };
}

export function sortWeightHistoryEntriesChronologically(
  entries: WeightHistoryEntry[]
): WeightHistoryEntry[] {
  return [...entries].sort((leftEntry, rightEntry) => {
    const measuredAtDifference =
      new Date(leftEntry.measuredAt).getTime() - new Date(rightEntry.measuredAt).getTime();

    if (measuredAtDifference !== 0) {
      return measuredAtDifference;
    }

    return leftEntry.id - rightEntry.id;
  });
}

function buildLinePath(points: WeightChartPoint[]): string {
  if (points.length < 2) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function createGuideLines({
  formatter,
  guideLineCount,
  maxWeight,
  minWeight,
  plotHeight,
  plotTop,
}: {
  formatter: Intl.NumberFormat;
  guideLineCount: number;
  maxWeight: number;
  minWeight: number;
  plotHeight: number;
  plotTop: number;
}): WeightChartGuideLine[] {
  if (guideLineCount < 2) {
    return [];
  }

  return Array.from({ length: guideLineCount }, (_, index) => {
    const ratio = index / (guideLineCount - 1);
    const lineWeight = maxWeight - (maxWeight - minWeight) * ratio;

    return {
      label: formatter.format(lineWeight),
      y: plotTop + plotHeight * ratio,
    };
  });
}

function getWeightDomain(entries: WeightHistoryEntry[]): {
  max: number;
  min: number;
} {
  const rawMin = Math.min(...entries.map((entry) => entry.weightKilograms));
  const rawMax = Math.max(...entries.map((entry) => entry.weightKilograms));

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
}

function shouldShowDateLabel(index: number, entryCount: number): boolean {
  if (entryCount <= 4) {
    return true;
  }

  if (index === 0 || index === entryCount - 1) {
    return true;
  }

  const labelStep = Math.ceil(entryCount / 4);

  return index % labelStep === 0;
}
