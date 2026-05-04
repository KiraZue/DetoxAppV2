import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // Always use localhost for web
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  
  // Try to dynamically get the IP address of the machine running Expo
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }
  
  // Fallback for Android emulator (10.0.2.2 points to host machine's localhost)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  // Final fallback (your previous IP)
  return 'http://10.0.0.11:3000';
};

export const API_URL = getApiUrl();
