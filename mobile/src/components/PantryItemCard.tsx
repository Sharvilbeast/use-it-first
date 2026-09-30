import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';
import { PantryItem, UrgencyStatus, StorageLocation } from '../types/pantry';
import {
  MilkIcon,
  VeggieIcon,
  BreadIcon,
  MeatIcon,
  CanIcon,
  ClockIcon,
  AlertIcon,
  ShieldCheckIcon,
} from './Icons';

interface PantryItemCardProps {
  item: PantryItem;
  onConsume: (id: string) => void;
  onDiscard: (id: string) => void;
  onToggleOpen: (id: string) => void;
  onPressDetails?: (item: PantryItem) => void;
}

export const PantryItemCard: React.FC<PantryItemCardProps> = ({
  item,
  onConsume,
  onDiscard,
  onToggleOpen,
  onPressDetails,
}) => {
  const panX = useRef(new Animated.Value(0)).current;
  const [swipeTriggered, setSwipeTriggered] = useState<'NONE' | 'LEFT' | 'RIGHT'>('NONE');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim gesture if horizontal movement dominates
        return Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Clamp swipe distance
        const clampedDx = Math.max(-140, Math.min(100, gestureState.dx));
        panX.setValue(clampedDx);

        if (clampedDx < -70) {
          setSwipeTriggered('LEFT');
        } else if (clampedDx > 50) {
          setSwipeTriggered('RIGHT');
        } else {
          setSwipeTriggered('NONE');
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          // Open left action drawer
          Animated.spring(panX, {
            toValue: -120,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        } else if (gestureState.dx > 60) {
          // Open right action drawer
          Animated.spring(panX, {
            toValue: 90,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        } else {
          // Snap back
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
          setSwipeTriggered('NONE');
        }
      },
    })
  ).current;

  const resetSwipe = () => {
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
    setSwipeTriggered('NONE');
  };

  const renderCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dairy':
        return <MilkIcon size={20} color={Colors.brand[700]} />;
      case 'produce':
      case 'vegetables':
      case 'fruits':
        return <VeggieIcon size={20} color="#16A34A" />;
      case 'bakery':
        return <BreadIcon size={20} color="#D97706" />;
      case 'meat':
      case 'seafood':
        return <MeatIcon size={20} color="#DC2626" />;
      default:
        return <CanIcon size={20} color="#4F46E5" />;
    }
  };

  const getLocationLabel = (loc: StorageLocation) => {
    switch (loc) {
      case 'FRIDGE':
        return 'Fridge';
      case 'FREEZER':
        return 'Freezer';
      case 'PANTRY':
        return 'Kitchen';
    }
  };

  const getUrgencyConfig = (urgency: UrgencyStatus, daysRemaining: number) => {
    switch (urgency) {
      case 'USE_TODAY':
        return {
          palette: Colors.urgency.useToday,
          text: daysRemaining === 0 ? 'Expires Today' : `${daysRemaining}d Left (Urgent)`,
          iconRenderer: () => <ClockIcon size={12} color={Colors.urgency.useToday.text} strokeWidth={2.5} />,
        };
      case 'THIS_WEEK':
        return {
          palette: Colors.urgency.thisWeek,
          text: `${daysRemaining}d Left`,
          iconRenderer: () => <AlertIcon size={12} color={Colors.urgency.thisWeek.text} strokeWidth={2.5} />,
        };
      case 'LATER':
        return {
          palette: Colors.urgency.later,
          text: `${daysRemaining}d Left`,
          iconRenderer: () => <ShieldCheckIcon size={12} color={Colors.urgency.later.text} strokeWidth={2.5} />,
        };
      case 'EXPIRED':
        return {
          palette: Colors.urgency.expired,
          text: `Expired ${Math.abs(daysRemaining)}d ago`,
          iconRenderer: () => <AlertIcon size={12} color={Colors.urgency.expired.text} strokeWidth={2.5} />,
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(item.urgencyStatus, item.daysRemaining);

  return (
    <View style={styles.outerContainer}>
      {/* Background Action Trays */}
      <View style={styles.backgroundTray}>
        {/* Right-Swipe Action Tray (Mark Opened) */}
        <TouchableOpacity
          style={styles.openActionTray}
          onPress={() => {
            onToggleOpen(item.id);
            resetSwipe();
          }}
          accessibilityLabel="Toggle item opened or stored"
        >
          <Text style={styles.actionIcon}>{item.openStatus === 'STORED' ? '🔓' : '🔒'}</Text>
          <Text style={styles.actionText}>
            {item.openStatus === 'STORED' ? 'Open' : 'Seal'}
          </Text>
        </TouchableOpacity>

        {/* Left-Swipe Action Tray (Consume & Discard) */}
        <View style={styles.leftActionsGroup}>
          <TouchableOpacity
            style={[styles.consumeButton, { backgroundColor: Colors.action.consume }]}
            onPress={() => {
              onConsume(item.id);
              resetSwipe();
            }}
            accessibilityLabel={`Consume ${item.name}`}
          >
            <Text style={styles.actionIcon}>✓</Text>
            <Text style={styles.actionText}>Cooked</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.discardButton, { backgroundColor: Colors.action.discard }]}
            onPress={() => {
              onDiscard(item.id);
              resetSwipe();
            }}
            accessibilityLabel={`Discard ${item.name}`}
          >
            <Text style={styles.actionIcon}>✕</Text>
            <Text style={styles.actionText}>Waste</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Foreground Swipeable Card */}
      <Animated.View
        style={[styles.card, { transform: [{ translateX: panX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            if (swipeTriggered !== 'NONE') {
              resetSwipe();
            } else if (onPressDetails) {
              onPressDetails(item);
            }
          }}
          style={styles.cardInner}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.quantity} ${item.unit}, located in ${item.location}, ${urgencyConfig.text}`}
        >
          {/* Status Indicator Left Border */}
          <View
            style={[
              styles.urgencyIndicatorStrip,
              { backgroundColor: urgencyConfig.palette.primary },
            ]}
          />

          <View style={styles.categoryIconCircle}>
            {renderCategoryIcon(item.category)}
          </View>

          <View style={styles.detailsCol}>
            <View style={styles.titleRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.openStatus === 'OPENED' && (
                <View style={styles.openedBadge}>
                  <Text style={styles.openedBadgeText}>Opened</Text>
                </View>
              )}
            </View>

            <Text style={styles.subtitle} numberOfLines={1}>
              {item.brand ? `${item.brand} • ` : ''}
              {item.quantity} {item.unit} • {getLocationLabel(item.location)}
            </Text>
          </View>

          {/* Right Status Badge */}
          <View
            style={[
              styles.urgencyBadge,
              {
                backgroundColor: urgencyConfig.palette.surface,
                borderColor: urgencyConfig.palette.border,
              },
            ]}
          >
            <View style={styles.urgencyBadgeIcon}>{urgencyConfig.iconRenderer()}</View>
            <Text style={[styles.urgencyBadgeText, { color: urgencyConfig.palette.text }]}>
              {urgencyConfig.text}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: Spacing.lg,
    marginVertical: 4,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface.background,
    overflow: 'hidden',
  },
  backgroundTray: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radii.md,
  },
  openActionTray: {
    width: 80,
    height: '100%',
    backgroundColor: Colors.brand[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftActionsGroup: {
    flexDirection: 'row',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  consumeButton: {
    width: 65,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButton: {
    width: 65,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.md,
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 72,
  },
  urgencyIndicatorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: Radii.md,
    borderBottomLeftRadius: Radii.md,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
    marginRight: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    fontWeight: '700',
    flexShrink: 1,
  },
  openedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.xs,
  },
  openedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 4,
  },
  urgencyBadgeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencyBadgeText: {
    ...Typography.badge,
    fontSize: 11,
  },
});
