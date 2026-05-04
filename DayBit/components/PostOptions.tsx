import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from './theme';

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
  onBookmark,
  onBlock,
  isBookmarked = false,
}) => {
  const handleReport = () => {
    onClose();
    if (onReport) {
      onReport();
    } else {
      Alert.alert('Report', 'This post has been reported for review.');
    }
  };

  const handleBookmark = () => {
    onClose();
    if (onBookmark) {
      onBookmark();
    } else {
      Alert.alert(isBookmarked ? 'Bookmark Removed' : 'Bookmarked', isBookmarked ? 'Post removed from bookmarks.' : 'Post added to bookmarks!');
    }
  };

  const handleBlock = () => {
    onClose();
    if (onBlock) {
      onBlock();
    } else {
      Alert.alert('Block User', 'This user has been blocked.');
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
        <View style={styles.container}>
          <View style={styles.handleBar} />
          
          <TouchableOpacity style={styles.option} onPress={handleReport}>
            <View style={[styles.optionIcon, styles.reportIcon]}>
              <Ionicons name="flag" size={20} color={colors.error} />
            </View>
            <Text style={styles.optionText}>Report Post</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleBookmark}>
            <View style={[styles.optionIcon, styles.bookmarkIcon]}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? colors.primary : colors.text} 
              />
            </View>
            <Text style={styles.optionText}>
              {isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleBlock}>
            <View style={[styles.optionIcon, styles.blockIcon]}>
              <Ionicons name="ban" size={20} color={colors.error} />
            </View>
            <Text style={styles.optionText}>Block User</Text>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
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
  reportIcon: {
    backgroundColor: colors.surface,
  },
  bookmarkIcon: {
    backgroundColor: colors.surface,
  },
  blockIcon: {
    backgroundColor: colors.surface,
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
});
