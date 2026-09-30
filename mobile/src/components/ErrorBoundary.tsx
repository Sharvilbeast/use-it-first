import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radii, Elevation } from '../theme/tokens';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, forward to Sentry / Datadog telemetry
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>
              {this.props.fallbackTitle || 'Something went wrong'}
            </Text>
            <Text style={styles.message}>
              {this.state.error?.message ||
                'An unexpected error occurred while rendering the pantry view. Your data is safe locally.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.retryButton}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Reload interface"
            >
              <Text style={styles.retryButtonText}>Reload View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.brand[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.md,
    marginTop: Spacing.sm,
  },
  retryButtonText: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
