import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { CameraIcon, EditIcon } from './Icons';

interface FabActionModalProps {
  onSelectScanReceipt: () => void;
  onSelectManualAdd: () => void;
}

export const FabActionModal: React.FC<FabActionModalProps> = ({
  onSelectScanReceipt,
  onSelectManualAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  const toggleModal = () => {
    if (isOpen) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 6,
      }).start();
    }
  };

  const spin = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const card1TranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const card2TranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 0],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* Floating Action Button */}
      <View style={styles.fabPositioner}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleModal}
          style={styles.fabButton}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Close add item options' : 'Add new items to pantry'}
        >
          <Animated.Text style={[styles.fabPlusText, { transform: [{ rotate: spin }] }]}>
            +
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Modal Overlay */}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={toggleModal}>
        <TouchableWithoutFeedback onPress={toggleModal}>
          <Animated.View style={[styles.modalBackdrop, { opacity }]}>
            <View style={styles.sheetContainer}>
              {/* Option 1: Scan Receipt */}
              <Animated.View
                style={[
                  styles.animatedActionWrapper,
                  { opacity, transform: [{ translateY: card1TranslateY }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.actionCard}
                  onPress={() => {
                    toggleModal();
                    onSelectScanReceipt();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Scan receipt or bill using camera"
                >
                  <View style={[styles.actionIconBubble, { backgroundColor: Colors.brand[50] }]}>
                    <CameraIcon size={22} color={Colors.brand[600]} strokeWidth={2.2} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>Scan Grocery Receipt</Text>
                    <Text style={styles.actionDescription}>
                      AI automatically parses line items & shelf life
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Option 2: Manual Add */}
              <Animated.View
                style={[
                  styles.animatedActionWrapper,
                  { opacity, transform: [{ translateY: card2TranslateY }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.actionCard}
                  onPress={() => {
                    toggleModal();
                    onSelectManualAdd();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Manually enter ingredient"
                >
                  <View style={[styles.actionIconBubble, { backgroundColor: '#EFF6FF' }]}>
                    <EditIcon size={22} color="#2563EB" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>Quick Manual Entry</Text>
                    <Text style={styles.actionDescription}>
                      Add single item, barcode, or fresh market produce
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Dismiss Trigger */}
              <TouchableOpacity
                style={styles.closeRoundButton}
                onPress={toggleModal}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.closeRoundText}>✕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabPositioner: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    zIndex: 99,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.fab,
  },
  fabPlusText: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.surface.overlay,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  sheetContainer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  animatedActionWrapper: {
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    ...Elevation.modal,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  actionIconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  actionDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  closeRoundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Elevation.card,
  },
  closeRoundText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
});
