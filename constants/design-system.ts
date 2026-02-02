// Unified Design System - Black & White Color Scheme
// Clean, elegant, professional aesthetic

const lightColors = {
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

const darkColors = {
    // Primary blacks and whites with glow
    black: '#FFFFFF',
    white: '#0A0A0F',

    // Greys with subtle glow tints
    grey900: '#E8F0FF', // Very light with blue glow
    grey800: '#D0E0FF', // Light with blue glow
    grey700: '#B8D0FF', // Medium-light with blue glow
    grey600: '#A0C0FF', // Medium with blue glow
    grey500: '#88B0FF', // Medium-bright with blue glow
    grey400: '#70A0FF', // Bright with blue glow
    grey300: '#2A3A5A', // Dark with blue tint
    grey200: '#1A2A4A', // Darker with blue tint
    grey100: '#0F1A2A', // Very dark with blue tint
    grey50: '#0A0F1A', // Darkest with blue tint

    // Semantic colors with glow
    success: '#00FFE5', // Cyan glow
    warning: '#FFD700', // Gold glow
    error: '#FF6B6B', // Red glow

    // Status indicators with glow
    statusGood: '#00FFE5', // Cyan glow
    statusWarning: '#FFD700', // Gold glow
    statusBad: '#FF6B6B', // Red glow

    // Backgrounds with subtle glow
    background: '#0A0F1A', // Deep dark blue-black
    backgroundSecondary: '#0F1520', // Slightly lighter dark blue-black
    backgroundTertiary: '#141A25', // Even lighter dark blue-black

    // Text with glow
    textPrimary: '#E8F0FF', // Bright white with blue glow
    textSecondary: '#88B0FF', // Medium blue with glow
    textTertiary: '#5A7ACC', // Darker blue
    textInverse: '#0A0F1A', // Dark background

    // Borders with glow
    border: '#1A2A4A', // Dark blue with subtle glow
    borderDark: '#2A3A5A', // Medium blue with glow

    // Shadows with glow effects
    shadowLight: 'rgba(0, 255, 229, 0.1)', // Cyan glow shadow
    shadowMedium: 'rgba(0, 255, 229, 0.2)', // Medium cyan glow
    shadowDark: 'rgba(0, 255, 229, 0.3)', // Strong cyan glow
};

// Function to get colors based on theme
export function getColors(theme: 'light' | 'dark' = 'light') {
    return theme === 'dark' ? darkColors : lightColors;
}

// Default export for backward compatibility (light mode)
export const Colors = lightColors;

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

// Function to get shadows based on theme
export function getShadows(theme: 'light' | 'dark' = 'light') {
    if (theme === 'dark') {
        return {
            none: {
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
            },
            sm: {
                shadowColor: '#00FFE5', // Cyan glow
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
            },
            md: {
                shadowColor: '#00FFE5', // Cyan glow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
            },
            lg: {
                shadowColor: '#00FFE5', // Cyan glow
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 6,
            },
            xl: {
                shadowColor: '#00FFE5', // Cyan glow
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 24,
                elevation: 8,
            },
        };
    }
    return {
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
}

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
