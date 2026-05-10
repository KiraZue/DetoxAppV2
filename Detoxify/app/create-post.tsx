import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';
import { spacing, fontSize, fontWeight, borderRadius } from '../components/theme';
import { useTheme } from '../components/ThemeContext';
import { useNotification } from '../components/NotificationProvider';
import { supabase } from '../supabase';

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
  const { showToast } = useNotification();
  const { colors } = useTheme();
  const router = useRouter();
  const [photoCaption, setPhotoCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [postMode, setPostMode] = useState<'photo' | 'text'>('photo');
  const [selectedBgColor, setSelectedBgColor] = useState(backgroundColors[0]);
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<{ id: string, username: string, avatar: string | null } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.user_metadata.username || 'Anonymous',
          avatar: session.user.user_metadata.avatar_url || null
        });
      }
    };
    fetchUser();
  }, []);

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
      setSelectedImage(asset.uri);
    }
  };

  const handlePost = async () => {
    if (!user) {
      showToast({ message: 'You must be logged in to post', type: 'error' });
      return;
    }

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
      formData.append('user_id', user.id);
      formData.append('user_name', user.username);
      formData.append('type', postMode);
      
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
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast({ message: '🚀 Post created successfully!', type: 'success' });
        router.replace('/(tabs)/feed');
      } else {
        throw new Error(result.error || 'Failed to create post');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      showToast({ message: error.message || 'Failed to create post', type: 'error' });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.username || 'Loading...'}</Text>
          </View>

          {/* Mode Switch Tabs */}
          <View style={[styles.modeTabs, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.modeTab, { backgroundColor: postMode === 'photo' ? colors.primary : 'transparent' }]} 
              onPress={() => setPostMode('photo')}
            >
              <Ionicons 
                name="image-outline" 
                size={20} 
                color={postMode === 'photo' ? colors.secondary : colors.text} 
              />
              <Text style={[styles.modeTabText, { color: postMode === 'photo' ? colors.secondary : colors.text }]}>
                Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, { backgroundColor: postMode === 'text' ? colors.primary : 'transparent' }]} 
              onPress={() => setPostMode('text')}
            >
              <Ionicons 
                name="text-outline" 
                size={20} 
                color={postMode === 'text' ? colors.secondary : colors.text} 
              />
              <Text style={[styles.modeTabText, { color: postMode === 'text' ? colors.secondary : colors.text }]}>
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
                  style={[styles.imageUpload, { backgroundColor: colors.surface, borderColor: selectedImage ? colors.primary : colors.border, borderStyle: selectedImage ? 'solid' : 'dashed' }]} 
                  onPress={handleImagePicker}
                >
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                      <Text style={[styles.uploadText, { color: colors.textMuted }]}>Tap to add a photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Caption Input for Photo Mode */}
                <TextInput
                  style={[styles.captionInput, { backgroundColor: colors.surface, color: colors.text }]}
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
                  style={[styles.textInput, { backgroundColor: selectedBgColor, color: colors.text }]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={colors.textLight}
                  value={textContent}
                  onChangeText={setTextContent}
                  multiline
                  textAlignVertical="center"
                />
                
                {/* Color Picker */}
                <View style={styles.colorPicker}>
                  {backgroundColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color, borderColor: selectedBgColor === color ? colors.primary : 'transparent' },
                      ]}
                      onPress={() => setSelectedBgColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Post Button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.postButton, { backgroundColor: colors.primary, opacity: (isPosting || (!photoCaption && !textContent)) ? 0.6 : 1 }]} 
          onPress={handlePost}
          disabled={isPosting || (!photoCaption && !textContent)}
        >
          {isPosting ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <>
              <Text style={[styles.postButtonText, { color: colors.secondary }]}>Post to Community</Text>
              <Ionicons name="send" size={20} color={colors.secondary} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
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
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  modeTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  contentContainer: {
    width: '100%',
  },
  photoModeWrapper: {
    gap: spacing.md,
  },
  imageUpload: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadText: {
    fontSize: fontSize.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  captionInput: {
    fontSize: fontSize.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 100,
  },
  textModeWrapper: {
    gap: spacing.md,
  },
  textInput: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  postButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
