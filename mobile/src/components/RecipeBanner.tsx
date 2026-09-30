import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { ChefIcon } from './Icons';

interface RecipeBannerProps {
  expiringItemNames: string[];
  onPressCook: () => void;
}

export const RecipeBanner: React.FC<RecipeBannerProps> = ({
  expiringItemNames,
  onPressCook,
}) => {
  if (expiringItemNames.length === 0) {
    return null;
  }

  const itemsPreview = expiringItemNames.slice(0, 3).join(', ');
  const remainingCount = expiringItemNames.length - 3;
  const itemsText = remainingCount > 0 ? `${itemsPreview} +${remainingCount} more` : itemsPreview;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.bannerContainer}
      onPress={onPressCook}
      accessibilityRole="button"
      accessibilityLabel={`Recipe recommendation. Use expiring food in a recipe tonight: ${itemsText}`}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <ChefIcon size={24} color="#FFFFFF" strokeWidth={2} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.bannerTitle}>Zero-Waste Chef</Text>
            <View style={styles.badgeUrgent}>
              <Text style={styles.badgeUrgentText}>Action Today</Text>
            </View>
          </View>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            Rescue {itemsText} tonight
          </Text>
        </View>

        <View style={styles.ctaChevronContainer}>
          <Text style={styles.ctaText}>Cook &gt;</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: Colors.brand[800],
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.brand[600],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.brand[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  chefEmoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bannerTitle: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeUrgent: {
    backgroundColor: Colors.urgency.useToday.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.xs,
  },
  badgeUrgentText: {
    ...Typography.badge,
    color: '#FFFFFF',
    fontSize: 10,
  },
  bannerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.brand[100],
    marginTop: 2,
  },
  ctaChevronContainer: {
    paddingLeft: Spacing.sm,
  },
  ctaText: {
    ...Typography.titleMedium,
    color: Colors.brand[300],
    fontWeight: '700',
  },
});
