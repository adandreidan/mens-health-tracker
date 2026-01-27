import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors as DesignColors, getColors } from '@/constants/design-system';
import { Spacing, BorderRadius, Shadows } from '@/constants/design-system';

export default function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = getColors(colorScheme);

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {colorScheme === 'dark' ? (
          <MaterialIcons name="light-mode" size={20} color={colors.textPrimary} />
        ) : (
          <MaterialIcons name="dark-mode" size={20} color={colors.textPrimary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

