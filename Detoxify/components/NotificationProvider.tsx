import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from './theme';

type ToastType = 'success' | 'error' | 'reward' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  icon?: any;
  duration?: number;
}

interface NotificationContextType {
  showToast: (options: ToastOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-100))[0];

  const showToast = useCallback(({ message, type = 'info', icon, duration = 3000 }: ToastOptions) => {
    setToast({ message, type, icon });
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide after duration
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }, duration);
  }, []);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: colors.primary, icon: 'checkmark-circle' };
      case 'error': return { bg: colors.error, icon: 'alert-circle' };
      case 'reward': return { bg: '#F59E0B', icon: 'trophy' };
      case 'info': return { bg: '#3B82F6', icon: 'information-circle' };
      default: return { bg: colors.text, icon: 'notifications' };
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { 
              backgroundColor: getToastStyle(toast.type!).bg,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons 
              name={toast.icon || getToastStyle(toast.type!).icon} 
              size={24} 
              color={colors.secondary} 
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toastText: {
    color: colors.secondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
});
