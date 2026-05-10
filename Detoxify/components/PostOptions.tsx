import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize, fontWeight, borderRadius } from './theme';
import { useTheme } from './ThemeContext';

interface PostOptionsProps {
  visible: boolean;
  onClose: () => void;
  onReport?: () => void;
  onBookmark?: () => void;
  onBlock?: () => void;
  isBookmarked?: boolean;
}

export const PostOptions: React.FC<PostOptionsProps> = ({
  visible,
  onClose,
  onReport,
}) => {
  const { colors } = useTheme();
  
  const handleReport = () => {
    onClose();
    if (onReport) {
      onReport();
    } else {
      Alert.alert('Report', 'This post has been reported for review.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity style={styles.option} onPress={handleReport}>
            <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="flag" size={20} color={colors.error} />
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>Report Post</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
