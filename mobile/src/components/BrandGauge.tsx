import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, G, Circle, Line } from 'react-native-svg';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { FreshnessSummary } from '../types/pantry';

interface BrandGaugeProps {
  summary: FreshnessSummary;
}

export const BrandGauge: React.FC<BrandGaugeProps> = ({ summary }) => {
  const animatedScore = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: summary.score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [summary.score]);

  // Radius = 75, cx = 100, cy = 95
  // Total arc angle = 180 degrees (from left (25, 95) to right (175, 95))
  // Arc length = Math.PI * 75 ≈ 235.62
  const R = 75;
  const cx = 100;
  const cy = 95;
  const arcLength = Math.PI * R;

  // Clamped ratio calculations to avoid layout overflow
  const redRatio = Math.max(0, Math.min(1, summary.redRatio));
  const amberRatio = Math.max(0, Math.min(1 - redRatio, summary.amberRatio));
  const greenRatio = Math.max(0, Math.min(1 - redRatio - amberRatio, summary.greenRatio));

  // Compute needle angle: 0 (Left / Red) -> 180 (Right / Green)
  const needleAngle = animatedScore.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 0],
    extrapolate: 'clamp',
  });

  const needleLength = 58;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.title}>Pantry Freshness Index</Text>
        <View style={styles.activeItemsBadge}>
          <Text style={styles.activeItemsText}>{summary.totalActiveCount} items active</Text>
        </View>
      </View>

      <View style={styles.svgWrapper}>
        <Svg width={200} height={115} viewBox="0 0 200 115">
          <G strokeWidth={14} fill="none" strokeLinecap="round">
            {/* Base Background Track */}
            <Path
              d="M 25 95 A 75 75 0 0 1 175 95"
              stroke="#E2E8F0"
              strokeDasharray={`${arcLength} ${arcLength}`}
              strokeDashoffset={0}
            />

            {/* Red Zone: Use Today (Starts from left 180deg) */}
            <Path
              d="M 25 95 A 75 75 0 0 1 175 95"
              stroke={Colors.urgency.useToday.primary}
              strokeDasharray={`${arcLength} ${arcLength}`}
              strokeDashoffset={0}
            />

            {/* Amber Zone: This Week */}
            <Path
              d="M 25 95 A 75 75 0 0 1 175 95"
              stroke={Colors.urgency.thisWeek.primary}
              strokeDasharray={`${arcLength} ${arcLength}`}
              strokeDashoffset={arcLength * redRatio}
            />

            {/* Green Zone: Later / Safe */}
            <Path
              d="M 25 95 A 75 75 0 0 1 175 95"
              stroke={Colors.urgency.later.primary}
              strokeDasharray={`${arcLength} ${arcLength}`}
              strokeDashoffset={arcLength * (redRatio + amberRatio)}
            />
          </G>

          {/* Pivot Circle */}
          <Circle cx={cx} cy={cy} r={7} fill={Colors.brand[900]} />
          <Circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />

          {/* Static Needle Render with Math Fallback */}
          {(() => {
            const rad = ((180 - (summary.score / 100) * 180) * Math.PI) / 180;
            const x2 = cx + needleLength * Math.cos(rad);
            const y2 = cy - needleLength * Math.sin(rad);
            return (
              <Line
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke={Colors.brand[900]}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            );
          })()}
        </Svg>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>{summary.score}</Text>
          <Text style={styles.scoreScale}>/100</Text>
        </View>
        <Text style={styles.healthStatusText}>
          {summary.score >= 80
            ? 'Optimal Freshness'
            : summary.score >= 50
            ? 'Action Recommended'
            : 'Urgent Action Required'}
        </Text>
      </View>

      {/* Tri-Color Status Breakdown Pills */}
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: Colors.urgency.useToday.surface, borderColor: Colors.urgency.useToday.border }]}>
          <View style={[styles.dot, { backgroundColor: Colors.urgency.useToday.primary }]} />
          <Text style={[styles.pillLabel, { color: Colors.urgency.useToday.text }]}>
            {summary.useTodayCount} Today
          </Text>
        </View>

        <View style={[styles.pill, { backgroundColor: Colors.urgency.thisWeek.surface, borderColor: Colors.urgency.thisWeek.border }]}>
          <View style={[styles.dot, { backgroundColor: Colors.urgency.thisWeek.primary }]} />
          <Text style={[styles.pillLabel, { color: Colors.urgency.thisWeek.text }]}>
            {summary.thisWeekCount} This Week
          </Text>
        </View>

        <View style={[styles.pill, { backgroundColor: Colors.urgency.later.surface, borderColor: Colors.urgency.later.border }]}>
          <View style={[styles.dot, { backgroundColor: Colors.urgency.later.primary }]} />
          <Text style={[styles.pillLabel, { color: Colors.urgency.later.text }]}>
            {summary.laterCount} Later
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
  },
  activeItemsBadge: {
    backgroundColor: Colors.brand[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  activeItemsText: {
    ...Typography.bodySmall,
    color: Colors.brand[700],
    fontWeight: '600',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: -16,
  },
  scoreNumber: {
    ...Typography.displayLarge,
    color: Colors.text.primary,
  },
  scoreScale: {
    ...Typography.bodyMedium,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  healthStatusText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pillLabel: {
    ...Typography.badge,
  },
});
