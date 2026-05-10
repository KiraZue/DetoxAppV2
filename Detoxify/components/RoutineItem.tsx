import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from './theme';

interface RoutineItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  completed?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const RoutineItem: React.FC<RoutineItemProps> = ({
  title,
  subtitle,
  icon,
  completed = false,
  onPress,
  onToggle,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style, completed && styles.completedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {icon && (
          <View style={[styles.iconContainer, completed && styles.completedIconContainer]}>
            <Ionicons
              name={icon}
              size={24}
              color={completed ? colors.secondary : colors.primary}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, completed && styles.completedTitle]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.checkButton} onPress={onToggle}>
        <Ionicons
          name={completed ? 'checkbox' : 'square-outline'}
          size={28}
          color={completed ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  completedContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  completedIconContainer: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  completedTitle: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  checkButton: {
    padding: spacing.xs,
  },
});
