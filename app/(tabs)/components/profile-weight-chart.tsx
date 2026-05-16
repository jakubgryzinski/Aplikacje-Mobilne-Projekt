import { useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppSettingsStore } from '@/store/app-settings';
import { useProfileStore } from '@/store/profile-store';

import { buildWeightChartModel } from './profile-chart-utils';

const CHART_HEIGHT = 220;
const GUIDE_LINE_COUNT = 4;
const LABEL_AREA_HEIGHT = 48;
const LEFT_AXIS_WIDTH = 44;
const MIN_CHART_WIDTH = 280;
const POINT_SPACING = 64;
const RIGHT_PADDING = 16;
const TOP_PADDING = 20;

function getLocale(languagePreference: 'en' | 'pl'): string {
  return languagePreference === 'pl' ? 'pl-PL' : 'en-US';
}

export function ProfileWeightChart() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const languagePreference = useAppSettingsStore((state) => state.languagePreference);
  const weightHistoryEntries = useProfileStore((state) => state.weightHistoryEntries);
  const [viewportWidth, setViewportWidth] = useState(0);
  const locale = getLocale(languagePreference);
  const resolvedViewportWidth = viewportWidth > 0 ? viewportWidth : MIN_CHART_WIDTH;
  const chartWidth = Math.max(
    resolvedViewportWidth,
    Math.max(MIN_CHART_WIDTH, weightHistoryEntries.length * POINT_SPACING)
  );
  const chartModel = useMemo(
    () =>
      buildWeightChartModel({
        chartHeight: CHART_HEIGHT + LABEL_AREA_HEIGHT,
        chartWidth,
        entries: weightHistoryEntries,
        guideLineCount: GUIDE_LINE_COUNT,
        locale,
        plotBottom: LABEL_AREA_HEIGHT,
        plotLeft: LEFT_AXIS_WIDTH,
        plotRight: RIGHT_PADDING,
        plotTop: TOP_PADDING,
      }),
    [chartWidth, locale, weightHistoryEntries]
  );

  const latestPointSummary = chartModel.latestPoint
    ? `${chartModel.latestPoint.weightLabel} ${t('tabScreens.profile.units.kilograms')} • ${chartModel.latestPoint.dateLabel}`
    : null;
  const accessibilityLabel = chartModel.latestPoint
    ? `${t('tabScreens.profile.chart.title')}. ${t('tabScreens.profile.chart.weightSeries')}. ${weightHistoryEntries.length}. ${t('tabScreens.profile.chart.latestPoint')}: ${latestPointSummary}.`
    : `${t('tabScreens.profile.chart.title')}. ${t('tabScreens.profile.chart.weightSeries')}. ${weightHistoryEntries.length}.`;

  function updateViewportWidth(event: LayoutChangeEvent) {
    setViewportWidth((currentWidth) => {
      const nextWidth = Math.round(event.nativeEvent.layout.width);

      return currentWidth === nextWidth ? currentWidth : nextWidth;
    });
  }

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold">{t('tabScreens.profile.chart.title')}</ThemedText>
        {latestPointSummary ? (
          <ThemedText style={{ color: palette.mutedText }}>
            {`${t('tabScreens.profile.chart.latestPoint')}: ${latestPointSummary}`}
          </ThemedText>
        ) : null}
      </View>

      {weightHistoryEntries.length === 0 ? (
        <ThemedText style={{ color: palette.mutedText }}>
          {t('tabScreens.profile.chart.empty')}
        </ThemedText>
      ) : (
        <View style={styles.chartContent}>
          <View style={styles.axisHeader}>
            <ThemedText style={{ color: palette.mutedText }}>
              {`${t('tabScreens.profile.chart.yAxis')} (${t('tabScreens.profile.units.kilograms')})`}
            </ThemedText>
          </View>

          <View onLayout={updateViewportWidth} style={styles.chartViewport}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartScrollContent}>
              <Svg height={CHART_HEIGHT + LABEL_AREA_HEIGHT} width={chartWidth}>
                {chartModel.guideLines.map((guideLine) => (
                  <Line
                    key={guideLine.label}
                    x1={LEFT_AXIS_WIDTH}
                    x2={chartWidth - RIGHT_PADDING}
                    y1={guideLine.y}
                    y2={guideLine.y}
                    stroke={palette.border}
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                ))}

                {chartModel.guideLines.map((guideLine) => (
                  <SvgText
                    key={`${guideLine.label}-axis`}
                    fill={palette.mutedText}
                    fontSize="11"
                    textAnchor="end"
                    x={LEFT_AXIS_WIDTH - 8}
                    y={guideLine.y + 4}>
                    {guideLine.label}
                  </SvgText>
                ))}

                {chartModel.linePath ? (
                  <Path
                    d={chartModel.linePath}
                    fill="none"
                    stroke={palette.tint}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                  />
                ) : null}

                {chartModel.points.map((point) => {
                  const isLatestPoint = chartModel.latestPoint?.id === point.id;

                  return (
                    <Circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      fill={isLatestPoint ? palette.tint : palette.background}
                      r={isLatestPoint ? 6 : 4}
                      stroke={palette.tint}
                      strokeWidth={2}
                    />
                  );
                })}

                {chartModel.points.map((point) =>
                  point.isLabelVisible ? (
                    <SvgText
                      key={`${point.id}-date`}
                      fill={palette.mutedText}
                      fontSize="11"
                      textAnchor="middle"
                      x={point.x}
                      y={CHART_HEIGHT + 20}>
                      {point.dateLabel}
                    </SvgText>
                  ) : null
                )}
              </Svg>
            </ScrollView>
          </View>

          <ThemedText style={[styles.axisCaption, { color: palette.mutedText }]}>
            {t('tabScreens.profile.chart.xAxis')}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  axisCaption: {
    textAlign: 'center',
  },
  axisHeader: {
    alignItems: 'flex-start',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  chartContent: {
    gap: 12,
  },
  chartScrollContent: {
    minWidth: '100%',
  },
  chartViewport: {
    width: '100%',
  },
  header: {
    gap: 4,
  },
});
