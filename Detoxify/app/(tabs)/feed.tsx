import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../config';
import { Post } from '../../components/Post';
import { spacing, fontSize, fontWeight } from '../../components/theme';
import { useTheme } from '../../components/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

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
  const { colors } = useTheme();
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || '';
      
      const response = await fetch(`${API_URL}/api/posts?user_id=${userId}`);
      const data = await response.json();
      
      console.log('Fetched posts data:', data);

      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('API did not return an array:', data);
        setPosts([]);
        if (data.error) {
          setError(data.error);
        } else {
          setError('Failed to load posts. Please check your backend connection.');
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Connection error. Is the backend server running?');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(false);
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.textLight }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchPosts()}>
              <Text style={[styles.retryButtonText, { color: colors.secondary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.feedContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Feed</Text>
            {posts.length > 0 ? (
              posts.map((post) => (
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
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No posts yet. Be the first to share!</Text>
              </View>
            )}
          </View>
        )}
        
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleCreatePost}>
        <Ionicons name="camera" size={28} color={colors.secondary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  feedContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  retryButtonText: {
    fontWeight: fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
