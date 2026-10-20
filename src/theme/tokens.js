export const theme = {
  light: {
    colors: {
      background: '#F5FBFF',
      surface: '#FFFFFF',
      primary: '#1F80EA',
      primaryHover: '#1A3E70',
      secondary: '#EEF2F6',
      success: '#1F80EA',
      error: '#E5484D',
      warning: '#F5A524',
      info: '#1F80EA',
      text: {
        primary: '#1A3E70',
        secondary: 'rgba(26,62,112,0.65)',
        muted: 'rgba(26,62,112,0.4)',
        onPrimary: '#FFFFFF',
      },
      border: 'rgba(26,62,112,0.08)',
      divider: 'rgba(26,62,112,0.05)',
    },
    shadow: {
      sm: {
        shadowColor: '#1A3E70',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#1A3E70',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
      },
      lg: {
        shadowColor: '#1A3E70',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 6,
      },
    },
  },
  dark: {
    colors: {
      background: '#0E1F38',
      surface: '#162A4A',
      primary: '#1F80EA',
      primaryHover: '#5AA7F1',
      secondary: '#223754',
      success: '#4DA3FF',
      error: '#FF6363',
      warning: '#F5A524',
      info: '#4DA3FF',
      text: {
        primary: '#E6F0FF',
        secondary: 'rgba(230,240,255,0.7)',
        muted: 'rgba(230,240,255,0.45)',
        onPrimary: '#FFFFFF',
      },
      border: 'rgba(230,240,255,0.08)',
      divider: 'rgba(230,240,255,0.05)',
    },
    shadow: {
      sm: {
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 6,
      },
    },
  },
};

export const colors = {
  background: theme.light.colors.background,
  foreground: theme.light.colors.text.primary,
  card: theme.light.colors.surface,
  cardForeground: theme.light.colors.text.primary,
  primary: theme.light.colors.primary,
  primaryForeground: theme.light.colors.text.onPrimary,
  secondary: theme.light.colors.secondary,
  accent: theme.light.colors.secondary,
  muted: '#EEF2F6',
  mutedForeground: theme.light.colors.text.secondary,
  border: theme.light.colors.border,
  success: theme.light.colors.success,
  warning: theme.light.colors.warning,
  danger: theme.light.colors.error,
  info: theme.light.colors.info,
};

export const shadow = theme.light.shadow;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
  xl: 20,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  x2l: 48,
};

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    heading: 'Inter_600SemiBold',
    body: 'Inter_400Regular',
  },
  fontSize: {
    caption: 12,
    secondary: 13,
    body: 14,
    input: 16,
    cardTitle: 16,
    sectionTitle: 18,
    title: 20,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 20,
    x2l: 20,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const textStyles = {
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 26,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 24,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.cardTitle,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 22,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 20,
  },
  secondary: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.secondary,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 18,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 16,
  },
  button: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 16,
  },
  input: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.input,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 22,
  },
};
