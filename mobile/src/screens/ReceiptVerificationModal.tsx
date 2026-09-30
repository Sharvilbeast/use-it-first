import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { ReceiptItemDraft, StorageLocation } from '../types/pantry';

interface ReceiptVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmImport: (items: ReceiptItemDraft[]) => void;
}

const mockParsedDrafts: ReceiptItemDraft[] = [
  {
    tempId: 'draft-1',
    name: 'Amul Butter 500g',
    quantity: 1,
    unit: 'pack',
    category: 'Dairy',
    estimatedShelfLifeDays: 90,
    storageLocation: 'FRIDGE',
    expiryDate: '2026-12-29',
    estimatedPrice: 275.0,
    confidence: 0.98,
    isSelected: true,
  },
  {
    tempId: 'draft-2',
    name: 'Epigamia Greek Yogurt Natural',
    quantity: 2,
    unit: 'cups',
    category: 'Dairy',
    estimatedShelfLifeDays: 12,
    storageLocation: 'FRIDGE',
    expiryDate: '2026-10-12',
    estimatedPrice: 120.0,
    confidence: 0.96,
    isSelected: true,
  },
  {
    tempId: 'draft-3',
    name: 'Organic Bananas Robusta',
    quantity: 1,
    unit: 'bunch',
    category: 'Produce',
    estimatedShelfLifeDays: 3,
    storageLocation: 'PANTRY',
    expiryDate: '2026-10-03',
    estimatedPrice: 65.0,
    confidence: 0.91,
    isSelected: true,
  },
  {
    tempId: 'draft-4',
    name: 'Whole Wheat Sandwich Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    estimatedShelfLifeDays: 5,
    storageLocation: 'PANTRY',
    expiryDate: '2026-10-05',
    estimatedPrice: 50.0,
    confidence: 0.94,
    isSelected: true,
  },
];

export const ReceiptVerificationModal: React.FC<ReceiptVerificationModalProps> = ({
  visible,
  onClose,
  onConfirmImport,
}) => {
  const [drafts, setDrafts] = useState<ReceiptItemDraft[]>(mockParsedDrafts);

  const toggleSelect = (tempId: string) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateItemName = (tempId: string, name: string) => {
    setDrafts((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, name } : item))
    );
  };

  const updateStorageLocation = (tempId: string, storageLocation: StorageLocation) => {
    setDrafts((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, storageLocation } : item))
    );
  };

  const adjustShelfLife = (tempId: string, deltaDays: number) => {
    setDrafts((prev) =>
      prev.map((item) => {
        if (item.tempId !== tempId) return item;
        const newDays = Math.max(1, item.estimatedShelfLifeDays + deltaDays);
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + newDays);
        return {
          ...item,
          estimatedShelfLifeDays: newDays,
          expiryDate: expDate.toISOString().split('T')[0],
        };
      })
    );
  };

  const removeItem = (tempId: string) => {
    setDrafts((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const addNewItem = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const newItem: ReceiptItemDraft = {
      tempId: `draft-custom-${Date.now()}`,
      name: 'New Grocery Item',
      quantity: 1,
      unit: 'units',
      category: 'Produce',
      estimatedShelfLifeDays: 7,
      storageLocation: 'FRIDGE',
      expiryDate: today.toISOString().split('T')[0],
      estimatedPrice: 0.0,
      confidence: 1.0,
      isSelected: true,
    };
    setDrafts((prev) => [...prev, newItem]);
  };

  const selectedCount = drafts.filter((d) => d.isSelected).length;
  const totalCost = drafts
    .filter((d) => d.isSelected)
    .reduce((sum, d) => sum + d.estimatedPrice, 0);

  const handleConfirm = () => {
    onConfirmImport(drafts);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerCloseBtn}>
            <Text style={styles.headerCloseText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenterCol}>
            <Text style={styles.headerTitle}>Review Scanned Bill</Text>
            <Text style={styles.headerSubtitle}>96% OCR Confidence • 4 Items Extracted</Text>
          </View>
          <TouchableOpacity onPress={addNewItem} style={styles.addMissingBtn}>
            <Text style={styles.addMissingText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Item Edit Cards */}
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {drafts.map((item) => (
            <View
              key={item.tempId}
              style={[styles.draftCard, !item.isSelected && styles.draftCardUnselected]}
            >
              <View style={styles.cardTopRow}>
                {/* Select Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleSelect(item.tempId)}
                  style={[styles.checkbox, item.isSelected && styles.checkboxActive]}
                >
                  {item.isSelected && <Text style={styles.checkCheckmark}>✓</Text>}
                </TouchableOpacity>

                {/* Editable Name Input */}
                <TextInput
                  value={item.name}
                  onChangeText={(txt) => updateItemName(item.tempId, txt)}
                  style={[styles.nameInput, !item.isSelected && styles.nameInputUnselected]}
                  placeholder="Item Name"
                />

                <TouchableOpacity
                  onPress={() => removeItem(item.tempId)}
                  style={styles.deleteBtn}
                  accessibilityLabel="Delete item"
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Location Selectors */}
              <View style={styles.locationSelectorRow}>
                <Text style={styles.fieldLabel}>Storage:</Text>
                {(['PANTRY', 'FRIDGE', 'FREEZER'] as StorageLocation[]).map((loc) => {
                  const isActive = item.storageLocation === loc;
                  const locLabels: Record<StorageLocation, string> = {
                    PANTRY: '🧺 Kitchen',
                    FRIDGE: '❄️ Fridge',
                    FREEZER: '🧊 Freezer',
                  };
                  return (
                    <TouchableOpacity
                      key={loc}
                      onPress={() => updateStorageLocation(item.tempId, loc)}
                      style={[styles.locPill, isActive && styles.locPillActive]}
                    >
                      <Text style={[styles.locPillText, isActive && styles.locPillTextActive]}>
                        {locLabels[loc]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Shelf Life Stepper & Estimated Date */}
              <View style={styles.shelfLifeRow}>
                <Text style={styles.fieldLabel}>Shelf Life:</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={() => adjustShelfLife(item.tempId, -1)}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValueText}>
                    {item.estimatedShelfLifeDays} days
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjustShelfLife(item.tempId, 1)}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTag}>
                  <Text style={styles.dateTagText}>Exp: {item.expiryDate}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Confirmation Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSummaryRow}>
            <Text style={styles.summaryCountText}>{selectedCount} items selected</Text>
            <Text style={styles.summaryTotalText}>Total: ₹{totalCost.toFixed(0)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleConfirm}
            disabled={selectedCount === 0}
            style={[styles.confirmButton, selectedCount === 0 && styles.confirmButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={`Import ${selectedCount} items to pantry`}
          >
            <Text style={styles.confirmButtonText}>
              Add {selectedCount} Items to Pantry ➔
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    backgroundColor: Colors.surface.card,
  },
  headerCloseBtn: {
    padding: Spacing.xs,
  },
  headerCloseText: {
    fontSize: 20,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  headerCenterCol: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.brand[600],
    fontWeight: '600',
    marginTop: 2,
  },
  addMissingBtn: {
    backgroundColor: Colors.brand[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.sm,
  },
  addMissingText: {
    ...Typography.bodySmall,
    color: Colors.brand[700],
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  draftCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.md,
    padding: Spacing.md,
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  draftCardUnselected: {
    opacity: 0.5,
    backgroundColor: Colors.surface.cardElevated,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.brand[600],
    borderColor: Colors.brand[600],
  },
  checkCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  nameInput: {
    flex: 1,
    ...Typography.titleMedium,
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingVertical: 4,
  },
  nameInputUnselected: {
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    padding: 6,
  },
  deleteText: {
    color: Colors.text.tertiary,
    fontSize: 16,
  },
  locationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
    width: 70,
  },
  locPill: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  locPillActive: {
    backgroundColor: Colors.brand[600],
    borderColor: Colors.brand[600],
  },
  locPillText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontSize: 11,
  },
  locPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shelfLifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.cardElevated,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand[700],
  },
  stepperValueText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text.primary,
    paddingHorizontal: 4,
  },
  dateTag: {
    marginLeft: 'auto',
    backgroundColor: Colors.surface.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  dateTagText: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    ...Elevation.modal,
  },
  footerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryCountText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  summaryTotalText: {
    ...Typography.bodyMedium,
    color: Colors.brand[700],
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: Colors.brand[600],
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border.medium,
  },
  confirmButtonText: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
