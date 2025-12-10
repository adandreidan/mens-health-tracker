// Unified Design System - Black & White Color Scheme
// Clean, elegant, professional aesthetic

export const Colors = {
    // Primary blacks and whites
    black: '#000000',
    white: '#FFFFFF',

    // Greys (ordered from darkest to lightest)
    grey900: '#0A0A0A',
    grey800: '#1A1A1A',
    grey700: '#2A2A2A',
    grey600: '#3A3A3A',
    grey500: '#666666',
    grey400: '#999999',
    grey300: '#CCCCCC',
    grey200: '#E5E5E5',
    grey100: '#F5F5F5',
    grey50: '#FAFAFA',

    // Semantic colors (monochrome versions)
    success: '#000000',
    warning: '#666666',
    error: '#3A3A3A',

    // Status indicators
    statusGood: '#000000',
    statusWarning: '#666666',
    statusBad: '#3A3A3A',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#FAFAFA',
    backgroundTertiary: '#F5F5F5',

    // Text
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E5E5E5',
    borderDark: '#CCCCCC',

    // Shadows (used in elevation)
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
};

export const Typography = {
    // Font sizes
    size: {
        xs: 11,
        sm: 13,
        base: 15,
        lg: 17,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        huge: 48,
    },

    // Font weights
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

export const Shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
    xl: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
};
