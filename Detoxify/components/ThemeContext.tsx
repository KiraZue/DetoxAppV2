import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors as lightColors } from './theme';

// Define Dark Mode Colors
export const darkColors = {
  primary: '#81C784', // Slightly lighter green for better contrast on dark
  primaryLight: '#A5D6A7',
  primaryDark: '#4CAF50',
  secondary: '#121212',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textLight: '#B0B0B0',
  textMuted: '#808080',
  border: '#333333',
  disabled: '#444444',
  success: '#81C784',
  error: '#FF5252',
  warning: '#FFB74D',
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeColors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
