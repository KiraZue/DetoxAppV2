import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { colors, spacing, fontSize, fontWeight } from './theme';
import { Card } from './Card';
import { CommentsModal } from './CommentsModal';
import { PostOptions } from './PostOptions';

interface Comment {
  id: string;
  user: {
    name: string;
  };
  text: string;
  time: string;
  replies?: Comment[];
}

interface PostProps {
  user: {
    name: string;
    avatar: string;
  };
  image?: string | null;
  caption: string;
  likes: number;
  isLiked?: boolean;
  comments: number;
  time: string;
  postId?: string;
  initialComments?: Comment[];
  style?: StyleProp<ViewStyle>;
  type?: 'photo' | 'text';
  bgColor?: string | null;
  textContent?: string;
}

export const Post: React.FC<PostProps> = ({
  user,
  image,
  caption,
  likes,
  isLiked: initialIsLiked = false,
  comments,
  time,
  postId,
  initialComments = [],
  style,
  type = 'photo',
  bgColor,
  textContent,
}) => {
  console.log('--- Post Component Render ---');
  console.log('Type:', type);
  console.log('Image URL:', image);
  console.log('Text Content:', textContent);
  console.log('Caption:', caption);
  console.log('BG Color:', bgColor);
  const [isLiked, setIsLiked] = React.useState(initialIsLiked);
  const [likeCount, setLikeCount] = React.useState(likes);
  const [commentCount, setCommentCount] = React.useState(comments);
  const [showComments, setShowComments] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleAddComment = async () => {
    if (postId) {
      try {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comment`, { method: 'POST' });
        const data = await response.json();
        if (data.comments !== undefined) {
          setCommentCount(data.comments);
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    } else {
      setCommentCount(prev => prev + 1);
    }
  };

  const handleLike = async () => {
    if (postId) {
      try {
        const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'current_user' }),
        });
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likes);
      } catch (error) {
        console.error('Error liking post:', error);
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } else {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <>
      <Card style={[styles.container, style]}>
        {/* User Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowOptions(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Caption - Above Image */}
        {caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        )}

        {/* Post Content */}
        {type === 'photo' ? (
          <>
            {image ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.image} 
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Image loading error:', error.nativeEvent.error);
                  }}
                />
              </View>
            ) : (
              <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                </View>
              </View>
            )}
          </>
        ) : type === 'text' ? (
          <View style={[styles.textContentContainer, { backgroundColor: bgColor || colors.surface }]}>
            <Text style={styles.textContent}>{textContent || caption}</Text>
          </View>
        ) : null}

        {/* Interactions */}
        <View style={styles.interactions}>
          <View style={styles.leftInteractions}>
            <TouchableOpacity onPress={handleLike} style={styles.interactionButton}>
              <Ionicons 
                name={isLiked ? "leaf" : "leaf-outline"} 
                size={24} 
                color={isLiked ? colors.primary : colors.text} 
              />
              <Text style={styles.interactionText}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(true)} style={styles.interactionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              <Text style={styles.interactionText}>{commentCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        comments={initialComments}
        onAddComment={handleAddComment}
      />

      <PostOptions
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContentContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  textContent: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  interactions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  leftInteractions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
});
