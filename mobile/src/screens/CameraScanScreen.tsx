import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../theme/tokens';

interface CameraScanScreenProps {
  onClose: () => void;
  onReceiptCaptured: (mockReceiptUri: string) => void;
}

export const CameraScanScreen: React.FC<CameraScanScreenProps> = ({
  onClose,
  onReceiptCaptured,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate image capture and edge preprocessing
    setTimeout(() => {
      setIsCapturing(false);
      onReceiptCaptured('mock://receipt-captured-2026-09-30.jpg');
    }, 900);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Controls Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.circleButton}
          accessibilityLabel="Close camera"
        >
          <Text style={styles.topBarText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.modePill}>
          <Text style={styles.modeText}>🧾 Bill & Receipt OCR</Text>
        </View>

        <TouchableOpacity
          onPress={() => setTorchOn(!torchOn)}
          style={[styles.circleButton, torchOn && styles.circleButtonActive]}
          accessibilityLabel="Toggle torch light"
        >
          <Text style={styles.topBarText}>{torchOn ? '⚡' : '💡'}</Text>
        </TouchableOpacity>
      </View>

      {/* Viewport Framing Container */}
      <View style={styles.viewport}>
        {/* Semi-transparent dark masks */}
        <View style={styles.maskTop} />

        <View style={styles.framingGuide}>
          {/* Corner Guides (Targeting reticle) */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Center Scan Laser Guide */}
          <View style={styles.laserLine} />

          {/* Guide Hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Align receipt edges within the green framing box
            </Text>
          </View>
        </View>

        <View style={styles.maskBottom} />
      </View>

      {/* Bottom Shutter Action Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.subtextInstruction}>
          Supports thermal supermarket slips, grocery bills & invoices
        </Text>

        <View style={styles.shutterRow}>
          <View style={styles.shutterPlaceholder} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCapture}
            disabled={isCapturing}
            style={styles.shutterOuter}
            accessibilityRole="button"
            accessibilityLabel="Capture receipt image"
          >
            {isCapturing ? (
              <ActivityIndicator color={Colors.brand[600]} size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          <View style={styles.shutterPlaceholder} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButtonActive: {
    backgroundColor: Colors.brand[500],
  },
  topBarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeText: {
    ...Typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskTop: {
    width: '100%',
    height: 40,
  },
  maskBottom: {
    width: '100%',
    height: 40,
  },
  framingGuide: {
    width: '84%',
    height: '80%',
    borderRadius: Radii.md,
    position: 'relative',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.brand[500],
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: Radii.sm,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: Radii.sm,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: Radii.sm,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: Radii.sm,
  },
  laserLine: {
    height: 2,
    backgroundColor: Colors.brand[400],
    width: '90%',
    alignSelf: 'center',
    marginTop: '45%',
    shadowColor: Colors.brand[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  hintContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  hintText: {
    ...Typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  subtextInstruction: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  shutterPlaceholder: {
    width: 60,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
});
