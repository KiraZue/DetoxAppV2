import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../components/theme';

const backgroundColors = [
  '#FFEDD5',
  '#DBEAFE',
  '#E0E7FF',
  '#D1FAE5',
  '#FEF3C7',
  '#FECDD3',
  '#F3F4F6',
  '#EDE9FE',
];

export default function CreatePostScreen() {
  const router = useRouter();
  const [photoCaption, setPhotoCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [postMode, setPostMode] = useState<'photo' | 'text'>('photo');
  const [selectedBgColor, setSelectedBgColor] = useState(backgroundColors[0]);
  const [isPosting, setIsPosting] = useState(false);

  const handleBack = () => {
    router.replace('/(tabs)/feed');
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('Selected image asset:', asset);
      setSelectedImage(asset.uri);
    }
  };

  const handlePost = async () => {
    if (postMode === 'photo') {
      if (!photoCaption.trim()) {
        Alert.alert('Error', 'Please add a caption');
        return;
      }
    } else {
      if (!textContent.trim()) {
        Alert.alert('Error', 'Please add some text');
        return;
      }
    }
    
    setIsPosting(true);
    
    try {
      const formData = new FormData();
      formData.append('user_name', 'Your Name');
      formData.append('type', postMode);
      
      console.log('Creating post - mode:', postMode);
      console.log('Selected image:', selectedImage);
      
      if (postMode === 'photo') {
        formData.append('caption', photoCaption);
        if (selectedImage) {
          const uriParts = selectedImage.split('.');
          const fileExtension = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';
          const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
          
          const fileToUpload = {
            uri: selectedImage,
            name: `photo_${Date.now()}.${fileExtension}`,
            type: mimeType,
          };
          
          console.log('Uploading file:', fileToUpload);
          formData.append('image', fileToUpload as any);
        }
      } else {
        formData.append('text_content', textContent);
        formData.append('bg_color', selectedBgColor);
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Post created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/feed') }
        ]);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <Text style={styles.userName}>Your Name</Text>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity 
              style={[styles.modeTab, postMode === 'photo' && styles.modeTabActive]} 
              onPress={() => setPostMode('photo')}
            >
              <Ionicons 
                name="image-outline" 
                size={20} 
                color={postMode === 'photo' ? colors.secondary : colors.text} 
              />
              <Text style={[styles.modeTabText, postMode === 'photo' && styles.modeTabTextActive]}>
                Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, postMode === 'text' && styles.modeTabActive]} 
              onPress={() => setPostMode('text')}
            >
              <Ionicons 
                name="text-outline" 
                size={20} 
                color={postMode === 'text' ? colors.secondary : colors.text} 
              />
              <Text style={[styles.modeTabText, postMode === 'text' && styles.modeTabTextActive]}>
                Text
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Mode Content */}
          {postMode === 'photo' && (
            <View style={styles.contentContainer}>
              <View style={styles.photoModeWrapper}>
                {/* Image Upload Area */}
                <TouchableOpacity 
                  style={[styles.imageUpload, selectedImage && styles.imageUploadSelected]} 
                  onPress={handleImagePicker}
                >
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                      <Text style={styles.uploadText}>Tap to add a photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Caption Input for Photo Mode */}
                <TextInput
                  style={styles.captionInput}
                  placeholder="Write a caption..."
                  placeholderTextColor={colors.textMuted}
                  value={photoCaption}
                  onChangeText={setPhotoCaption}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          )}

          {/* Text Mode Content */}
          {postMode === 'text' && (
            <View style={styles.contentContainer}>
              <View style={styles.textModeWrapper}>
                <TextInput
                  style={[styles.textContentInput, { backgroundColor: selectedBgColor }]}
                  placeholder="Write something..."
                  placeholderTextColor={colors.textMuted}
                  value={textContent}
                  onChangeText={setTextContent}
                  multiline
                />
              </View>
              
              {/* Color Picker */}
              <View style={styles.colorPicker}>
                {backgroundColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedBgColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedBgColor(color)}
                  >
                    {selectedBgColor === color && (
                      <Ionicons name="checkmark" size={16} color={colors.text} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      
      {/* Post Button at Bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          onPress={handlePost} 
          style={[styles.bottomPostButton, isPosting && styles.postButtonDisabled]}
          disabled={isPosting}
        >
          {isPosting ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={styles.bottomPostButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  contentContainer: {
    width: '100%',
  },
  photoModeWrapper: {
    gap: spacing.md,
  },
  textModeWrapper: {
    marginBottom: spacing.md,
  },
  imageUpload: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageUploadSelected: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  captionInput: {
    width: '100%',
    minHeight: 100,
    fontSize: fontSize.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  textContentInput: {
    width: '100%',
    height: 300,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  modeTabTextActive: {
    color: colors.secondary,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bottomPostButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  bottomPostButtonText: {
    color: colors.secondary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
});
