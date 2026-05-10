import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import { spacing, fontSize, fontWeight, borderRadius } from '../../components/theme';
import { useTheme } from '../../components/ThemeContext';
import { useNotification } from '../../components/NotificationProvider';
import { supabase } from '../../supabase';
import { Card } from '../../components/Card';

const { width } = Dimensions.get('window');

const routines = {
  Morning: [
    { id: '1', title: 'Warm Lemon Water', description: 'Rehydrate and jumpstart your metabolism.', icon: 'water-outline' },
    { id: '2', title: 'Mindfulness Meditation', description: '10 minutes of silent breathing to center yourself.', icon: 'leaf-outline' },
    { id: '3', title: 'Digital Detox', description: 'Avoid social media for the first hour of the day.', icon: 'notifications-off-outline' },
    { id: '4', title: 'Gentle Stretching', description: 'Awaken your muscles with light yoga or stretches.', icon: 'body-outline' },
    { id: '5', title: 'Healthy Breakfast', description: 'Choose high-fiber foods to fuel your detox.', icon: 'nutrition-outline' },
    { id: '6', title: 'Sunlight Exposure', description: 'Get 5-10 minutes of natural light to set your rhythm.', icon: 'sunny-outline' },
    { id: '7', title: 'Cold Rinse', description: 'End your shower with 30 seconds of cold water.', icon: 'snow-outline' },
    { id: '8', title: 'Daily Intentions', description: 'Write down your top 3 goals for today.', icon: 'create-outline' },
  ],
  Afternoon: [
    { id: '1', title: 'Green Tea Break', description: 'Boost antioxidants and stay alert naturally.', icon: 'cafe-outline' },
    { id: '2', title: 'Mid-day Walk', description: 'A 15-minute walk to clear your head.', icon: 'walk-outline' },
    { id: '3', title: 'Hydration Goal', description: 'Drink at least 500ml of pure water.', icon: 'flask-outline' },
    { id: '4', title: 'Box Breathing', description: '4-second inhale, hold, exhale to reduce stress.', icon: 'timer-outline' },
    { id: '5', title: 'Post-Lunch Stretch', description: 'Relieve tension from sitting or working.', icon: 'fitness-outline' },
    { id: '6', title: 'Detox Snack', description: 'Handful of raw nuts or a piece of organic fruit.', icon: 'fast-food-outline' },
    { id: '7', title: 'Posture Check', description: 'Sit straight and roll your shoulders back.', icon: 'accessibility-outline' },
    { id: '8', title: 'Desk Declutter', description: 'Spend 2 minutes clearing your workspace.', icon: 'trash-outline' },
  ],
  Evening: [
    { id: '1', title: 'Foot Soak', description: 'Relax with warm water and Epsom salts.', icon: 'thermometer-outline' },
    { id: '2', title: 'Gratitude Journaling', description: 'Write down 3 positive things from today.', icon: 'book-outline' },
    { id: '3', title: 'Unplugging', description: 'No screens 1 hour before sleep.', icon: 'moon-outline' },
    { id: '4', title: 'Herbal Tea', description: 'Caffeine-free tea like chamomile or peppermint.', icon: 'color-filter-outline' },
    { id: '5', title: 'Read a Book', description: 'Engage your mind without blue light.', icon: 'library-outline' },
    { id: '6', title: 'Dim the Lights', description: 'Signal to your brain that it is time for rest.', icon: 'bulb-outline' },
    { id: '7', title: 'Skin Care', description: 'Cleanse and moisturize to detox your skin.', icon: 'sparkles-outline' },
    { id: '8', title: 'Deep Sleep Prep', description: 'Ensure your room is cool and completely dark.', icon: 'bed-outline' },
  ],
};

const encouragingWords = [
  "Every small step brings you closer to a cleaner you.",
  "Your body is your temple. Treat it with kindness.",
  "Detox is a journey of self-love and restoration.",
  "Progress over perfection. You're doing great!",
  "Clear your mind, heal your body, find your peace."
];

export default function RoutineScreen() {
  const { showToast } = useNotification();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchCompletedTasks(user.id);
      }
    };
    init();
  }, []);

  const fetchCompletedTasks = async (uid: string) => {
    try {
      const response = await fetch(`${API_URL}/api/routines?user_id=${uid}`);
      const data = await response.json();
      if (data.completed_tasks) setCompletedTasks(data.completed_tasks);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  const toggleTask = async (taskId: string, category: string) => {
    if (!userId) return;

    const taskKey = `${category}_${taskId}`;
    const isNowCompleted = !completedTasks.includes(taskKey);

    // Optimistic update
    if (isNowCompleted) {
      setCompletedTasks([...completedTasks, taskKey]);
    } else {
      setCompletedTasks(completedTasks.filter(id => id !== taskKey));
    }

    try {
      const response = await fetch(`${API_URL}/api/routines/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          task_id: taskKey,
          category,
          is_completed: isNowCompleted
        }),
      });
      const result = await response.json();

      if (isNowCompleted) {
        if (result.streak_updated) {
          showToast({
            message: `🔥 STREAK INCREASED! You are now at ${result.new_streak} days!`,
            type: 'reward',
            icon: 'flame'
          });
        } else if (result.all_done) {
          showToast({
            message: '🌟 ALL ROUTINES DONE! You completed your journey for today!',
            type: 'reward'
          });
        } else {
          // Check if category is done (8 tasks)
          const categoryTasks = completedTasks.filter(id => id.startsWith(category));
          if (categoryTasks.length === 8) {
            showToast({
              message: `✅ ${category.toUpperCase()} ROUTINE COMPLETE! Great job!`,
              type: 'success',
              icon: 'ribbon'
            });
          } else {
            showToast({
              message: 'Task completed!',
              type: 'success'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      showToast({ message: 'Failed to update routine', type: 'error' });
    }
  };

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as any);
    }
  }, [params.category]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setQuoteIndex((prev) => (prev + 1) % encouragingWords.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const CategoryTab = ({ name, icon }: { name: 'Morning' | 'Afternoon' | 'Evening', icon: any }) => {
    const isActive = selectedCategory === name;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, { backgroundColor: isActive ? colors.primary : colors.surface }, isActive && styles.categoryTabActive]}
        onPress={() => setSelectedCategory(name)}
      >
        <Ionicons
          name={(isActive ? icon : `${icon}-outline`) as any}
          size={24}
          color={isActive ? colors.secondary : colors.textMuted}
        />
        <Text style={[styles.categoryTabText, { color: isActive ? colors.secondary : colors.textMuted }, isActive && styles.categoryTabTextActive]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Routines</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>Curated steps for your daily detox</Text>
      </View>

      <View style={styles.tabsContainer}>
        <CategoryTab name="Morning" icon="sunny" />
        <CategoryTab name="Afternoon" icon="partly-sunny" />
        <CategoryTab name="Evening" icon="moon" />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.content}>
          {routines[selectedCategory].map((item, index) => (
            <Card key={item.id} style={[styles.routineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.routineHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon as any} size={26} color={colors.primary} />
                </View>
                <View style={styles.routineInfo}>
                  <Text style={[styles.routineTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.routineDescription, { color: colors.textLight }]}>{item.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => toggleTask(item.id, selectedCategory)}
                >
                  <Ionicons
                    name={completedTasks.includes(`${selectedCategory}_${item.id}`) ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={completedTasks.includes(`${selectedCategory}_${item.id}`) ? colors.primary : colors.border}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          ))}

        </View>
      </ScrollView>

      {/* Auto-sliding Encouragement Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
          <Ionicons name="sparkles" size={18} color={colors.primary} style={styles.sparkleIcon} />
          <Text style={[styles.quoteText, { color: colors.text }]}>{encouragingWords[quoteIndex]}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTabActive: {
    // Handled by dynamic style
  },
  categoryTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  categoryTabTextActive: {
    // Handled by dynamic style
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  routineCard: {
    padding: spacing.md,
    borderWidth: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  routineDescription: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  checkButton: {
    padding: spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.full,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sparkleIcon: {
    opacity: 0.8,
  },
  quoteText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
