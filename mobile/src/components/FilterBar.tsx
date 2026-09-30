import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../theme/tokens';
import { LocationFilter, StateFilter } from '../types/pantry';
import { HomeIcon, PantryIcon, FridgeIcon, FreezerIcon } from './Icons';

interface FilterBarProps {
  selectedLocation: LocationFilter;
  selectedState: StateFilter;
  onSelectLocation: (loc: LocationFilter) => void;
  onSelectState: (state: StateFilter) => void;
  locationCounts: {
    all: number;
    pantry: number;
    fridge: number;
    freezer: number;
  };
  stateCounts: {
    all: number;
    stored: number;
    opened: number;
    expired: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedLocation,
  selectedState,
  onSelectLocation,
  onSelectState,
  locationCounts,
  stateCounts,
}) => {
  const locationTabs: {
    id: LocationFilter;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
    count: number;
  }[] = [
    {
      id: 'ALL',
      label: 'All Pantries',
      icon: (isActive) => (
        <HomeIcon size={16} color={isActive ? '#FFFFFF' : Colors.slate[500]} strokeWidth={2.2} />
      ),
      count: locationCounts.all,
    },
    {
      id: 'PANTRY',
      label: 'Kitchen',
      icon: (isActive) => (
        <PantryIcon size={16} color={isActive ? '#FFFFFF' : Colors.slate[500]} strokeWidth={2.2} />
      ),
      count: locationCounts.pantry,
    },
    {
      id: 'FRIDGE',
      label: 'Fridge',
      icon: (isActive) => (
        <FridgeIcon size={16} color={isActive ? '#FFFFFF' : Colors.slate[500]} strokeWidth={2.2} />
      ),
      count: locationCounts.fridge,
    },
    {
      id: 'FREEZER',
      label: 'Freezer',
      icon: (isActive) => (
        <FreezerIcon size={16} color={isActive ? '#FFFFFF' : Colors.slate[500]} strokeWidth={2.2} />
      ),
      count: locationCounts.freezer,
    },
  ];

  const stateChips: { id: StateFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Items', count: stateCounts.all },
    { id: 'STORED', label: 'Stored (Unopened)', count: stateCounts.stored },
    { id: 'OPENED', label: 'Opened (Active)', count: stateCounts.opened },
    { id: 'EXPIRED', label: 'Expired', count: stateCounts.expired },
  ];

  return (
    <View style={styles.container}>
      {/* Tier 1: Location Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.locationScrollContent}
      >
        {locationTabs.map((tab) => {
          const isActive = selectedLocation === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onSelectLocation(tab.id)}
              style={[styles.locationTab, isActive && styles.locationTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabIcon}>{tab.icon(isActive)}</View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tier 2: State Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stateChipsScrollContent}
      >
        {stateChips.map((chip) => {
          const isActive = selectedState === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.7}
              onPress={() => onSelectState(chip.id)}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
              <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
                <Text style={[styles.chipBadgeText, isActive && styles.chipBadgeTextActive]}>
                  {chip.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.background,
    paddingVertical: Spacing.xs,
  },
  locationScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  locationTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  locationTabActive: {
    backgroundColor: Colors.brand[800],
    borderColor: Colors.brand[800],
  },
  tabIcon: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: Colors.surface.cardElevated,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.full,
  },
  tabBadgeActive: {
    backgroundColor: Colors.brand[700],
  },
  tabBadgeText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  stateChipsScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  chipActive: {
    backgroundColor: Colors.brand[50],
    borderColor: Colors.brand[500],
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.brand[800],
    fontWeight: '700',
  },
  chipBadge: {
    marginLeft: 6,
    backgroundColor: Colors.surface.cardElevated,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.full,
  },
  chipBadgeActive: {
    backgroundColor: Colors.brand[200],
  },
  chipBadgeText: {
    ...Typography.badge,
    fontSize: 10,
    color: Colors.text.secondary,
  },
  chipBadgeTextActive: {
    color: Colors.brand[900],
  },
});
