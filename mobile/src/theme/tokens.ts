export const Colors = {
  // Brand Palette: Emerald & Deep Forest
  brand: {
    50: '#E6F7F0',
    100: '#C2EEDC',
    200: '#99E3C5',
    300: '#57CF9F',
    400: '#2EB880',
    500: '#10B981', // Vibrant Accent
    600: '#0D7A57', // Primary Brand Emerald
    700: '#0A5C41',
    800: '#064E3B', // Deep Forest
    900: '#022C22',
  },

  // Semantic Urgency Palette (WCAG 2.2 AAA / AA Compliant)
  urgency: {
    useToday: {
      primary: '#EF4444',
      dark: '#DC2626',
      surface: '#FEF2F2',
      border: '#FCA5A5',
      text: '#991B1B',
      contrastRatio: '5.1:1',
      badgeText: 'USE TODAY',
    },
    thisWeek: {
      primary: '#F59E0B',
      dark: '#D97706',
      surface: '#FFFBEB',
      border: '#FCD34D',
      text: '#92400E',
      contrastRatio: '4.6:1',
      badgeText: 'THIS WEEK',
    },
    later: {
      primary: '#10B981',
      dark: '#059669',
      surface: '#ECFDF5',
      border: '#A7F3D0',
      text: '#065F46',
      contrastRatio: '4.8:1',
      badgeText: 'SAFE',
    },
    expired: {
      primary: '#64748B',
      dark: '#475569',
      surface: '#F1F5F9',
      border: '#CBD5E1',
      text: '#334155',
      contrastRatio: '6.2:1',
      badgeText: 'EXPIRED',
    },
  },

  // Surface & Neutral Tokens
  surface: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#F1F5F9',
    cardPressed: '#E2E8F0',
    sheet: '#FFFFFF',
    overlay: 'rgba(2, 44, 34, 0.65)',
  },

  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    brand: '#0D7A57',
  },

  border: {
    subtle: '#E2E8F0',
    medium: '#CBD5E1',
    active: '#0D7A57',
  },

  // Action Colors
  action: {
    consume: '#10B981',
    discard: '#EF4444',
    open: '#3B82F6',
    donate: '#8B5CF6',
  },

  // Luxury FinTech & Glassmorphic Tokens (Directly matching reference UI designs)
  luxury: {
    primaryBlue: '#2563EB',
    deepBlue: '#1D4ED8',
    sapphire: '#1E40AF',
    skyAccent: '#38BDF8',
    glowBlue: 'rgba(37, 99, 235, 0.35)',
    glassCardBg: 'rgba(255, 255, 255, 0.92)',
    glassBorder: 'rgba(255, 255, 255, 0.45)',
    glassNavBg: 'rgba(15, 23, 42, 0.85)',
    countdownOrange: '#F97316',
    countdownPillBg: 'rgba(249, 115, 22, 0.85)',
  },
};

export const Typography = {
  displayLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  headlineLarge: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  tabularNumber: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Elevation = {
  card: {
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modal: {
    shadowColor: '#022C22',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  fab: {
    shadowColor: '#0D7A57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
