import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius } from './theme';
import { useTheme } from './ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.container, styles[`${size}Container`]];

    switch (variant) {
      case 'secondary':
        baseStyle.push({ backgroundColor: colors.surface });
        break;
      case 'outline':
        baseStyle.push({ backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary });
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: colors.error });
        break;
      default:
        baseStyle.push({ backgroundColor: colors.primary });
    }

    if (disabled) {
      baseStyle.push({ backgroundColor: colors.disabled, borderColor: colors.disabled });
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'secondary':
        baseStyle.push({ color: colors.primary });
        break;
      case 'outline':
        baseStyle.push({ color: colors.primary });
        break;
      case 'danger':
        baseStyle.push({ color: colors.secondary });
        break;
      default:
        baseStyle.push({ color: colors.secondary });
    }

    if (disabled) {
      baseStyle.push({ color: colors.textMuted });
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.secondary} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.md,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
});
