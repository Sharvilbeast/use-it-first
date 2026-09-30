import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { usePantryStore } from '../state/pantryStore';
import { BrandGauge } from '../components/BrandGauge';
import { RecipeBanner } from '../components/RecipeBanner';
import { FilterBar } from '../components/FilterBar';
import { PantryItemCard } from '../components/PantryItemCard';
import { FabActionModal } from '../components/FabActionModal';
import { CameraScanScreen } from './CameraScanScreen';
import { ReceiptVerificationModal } from './ReceiptVerificationModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SearchIcon, SavingsIcon } from '../components/Icons';
import { PantryItem, ReceiptItemDraft } from '../types/pantry';

export const SmartPantryScreen: React.FC = () => {
  const {
    filter,
    setFilter,
    consumeItem,
    discardItem,
    toggleOpenItem,
    batchAddItems,
    getFreshnessSummary,
    getFilteredItems,
    getExpiringItemNames,
    getLocationCounts,
    getStateCounts,
    totalSavedINR,
  } = usePantryStore();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const freshnessSummary = useMemo(() => getFreshnessSummary(), [getFreshnessSummary]);
  const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems]);
  const expiringItemNames = useMemo(() => getExpiringItemNames(), [getExpiringItemNames]);
  const locationCounts = useMemo(() => getLocationCounts(), [getLocationCounts]);
  const stateCounts = useMemo(() => getStateCounts(), [getStateCounts]);

  const handleReceiptCaptured = (uri: string) => {
    setIsCameraOpen(false);
    // Open verification review bottom sheet with parsed mock/cloud results
    setIsVerificationOpen(true);
  };

  const handleConfirmImport = (drafts: ReceiptItemDraft[]) => {
    batchAddItems(drafts);
    Alert.alert(
      'Items Added!',
      `Successfully added ${drafts.filter((d) => d.isSelected).length} items to your pantry.`
    );
  };

  const handlePressCook = () => {
    Alert.alert(
      'Zero-Waste Chef',
      `Launching AI Recipe Generator with ${expiringItemNames.length} urgent ingredients!`
    );
  };

  // Fixed layout calculation: height 72px + 8px vertical margins = 80px
  const ITEM_HEIGHT = 80;
  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const renderPantryItem = React.useCallback(
    ({ item }: { item: PantryItem }) => (
      <PantryItemCard
        item={item}
        onConsume={consumeItem}
        onDiscard={discardItem}
        onToggleOpen={toggleOpenItem}
        onPressDetails={(i) => {
          Alert.alert(
            i.name,
            `Expiry: ${i.expiryDate}\nLocation: ${i.location}\nStatus: ${i.openStatus}\nShelf Life: ${i.daysRemaining} days left`
          );
        }}
      />
    ),
    [consumeItem, discardItem, toggleOpenItem]
  );

  return (
    <ErrorBoundary fallbackTitle="Smart Pantry Error">
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.surface.background} />

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Use It First</Text>
            <Text style={styles.tagline}>Save Food. Save Money. Waste Less.</Text>
          </View>

          <View style={styles.savingsPill}>
            <View style={styles.savingsPillIcon}>
              <SavingsIcon size={16} color={Colors.brand[700]} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.savingsLabel}>Month Saved</Text>
              <Text style={styles.savingsValue}>₹{totalSavedINR.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <SearchIcon size={16} color={Colors.text.tertiary} strokeWidth={2} />
          </View>
          <TextInput
            value={filter.searchQuery}
            onChangeText={(txt) => setFilter({ searchQuery: txt })}
            placeholder="Search spinach, milk, paneer, freezer..."
            placeholderTextColor={Colors.text.tertiary}
            style={styles.searchInput}
          />
          {filter.searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setFilter({ searchQuery: '' })}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Virtualized List with Header Components */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderPantryItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Animated Speedometer Freshness Gauge */}
              <BrandGauge summary={freshnessSummary} />

              {/* Dynamic AI Recipe Banner for Expiring Food */}
              <RecipeBanner
                expiringItemNames={expiringItemNames}
                onPressCook={handlePressCook}
              />

              {/* Dual-Tier Location & State Filters */}
              <FilterBar
                selectedLocation={filter.location}
                selectedState={filter.state}
                onSelectLocation={(loc) => setFilter({ location: loc })}
                onSelectState={(state) => setFilter({ state: state })}
                locationCounts={locationCounts}
                stateCounts={stateCounts}
              />

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {filter.location === 'ALL' ? 'All Pantry Items' : `${filter.location} Items`}
                </Text>
                <Text style={styles.itemCounterText}>
                  Showing {filteredItems.length} of {locationCounts.all}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🥑</Text>
              <Text style={styles.emptyTitle}>No items match your filter</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting "All Pantries" or search for a different ingredient.
              </Text>
            </View>
          }
        />

        {/* Floating Action Button with Animated Modal Options */}
        <FabActionModal
          onSelectScanReceipt={() => setIsCameraOpen(true)}
          onSelectManualAdd={() => {
            Alert.alert('Manual Add', 'Manual ingredient entry form opened.');
          }}
        />

        {/* Camera Scanning Viewport Modal */}
        {isCameraOpen && (
          <CameraScanScreen
            onClose={() => setIsCameraOpen(false)}
            onReceiptCaptured={handleReceiptCaptured}
          />
        )}

        {/* Receipt Verification Modal */}
        <ReceiptVerificationModal
          visible={isVerificationOpen}
          onClose={() => setIsVerificationOpen(false)}
          onConfirmImport={handleConfirmImport}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  brandTitle: {
    ...Typography.headlineLarge,
    color: Colors.brand[800],
    fontWeight: '800',
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.brand[600],
    fontWeight: '600',
    marginTop: 1,
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand[50],
    borderWidth: 1,
    borderColor: Colors.brand[200],
    borderRadius: Radii.md,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    gap: 6,
  },
  savingsPillIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsLabel: {
    ...Typography.badge,
    fontSize: 9,
    color: Colors.brand[700],
  },
  savingsValue: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.brand[900],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Elevation.card,
  },
  searchIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    padding: 0,
  },
  searchClear: {
    color: Colors.text.tertiary,
    fontSize: 16,
    paddingHorizontal: Spacing.xs,
  },
  listContent: {
    paddingBottom: 90, // Leave room for FAB
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  itemCounterText: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
