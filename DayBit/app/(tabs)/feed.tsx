import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../config';
import { Post } from '../../components/Post';
import { colors, spacing, fontSize, fontWeight } from '../../components/theme';
import { Ionicons } from '@expo/vector-icons';

interface APIPost {
  id: string;
  user: { name: string; avatar: string };
  image: string | null;
  caption: string;
  textContent: string;
  bgColor: string | null;
  type: 'photo' | 'text';
  likes: number;
  isLiked: boolean;
  comments: number;
  time: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();
      console.log('Fetched posts:', data);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.feedContainer}>
            <Text style={styles.sectionTitle}>Community Feed</Text>
            {posts.map((post) => (
              <Post
                key={post.id}
                user={post.user}
                image={post.image}
                caption={post.caption}
                textContent={post.textContent}
                likes={post.likes}
                isLiked={post.isLiked}
                comments={post.comments}
                time={post.time}
                postId={post.id}
                type={post.type}
                bgColor={post.bgColor}
              />
            ))}
          </View>
        )}
        
        {/* Spacing for tab bar */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <Ionicons name="camera" size={28} color={colors.secondary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
