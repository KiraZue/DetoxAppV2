import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // Always use localhost for web
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  
  // Try to dynamically get the IP address of the machine running Expo
  const debuggerHost = Constants.expoConfig?.hostUri;
  console.log('Debugger Host:', debuggerHost);

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    const url = `http://${ip}:3000`;
    console.log('Detected API URL:', url);
    return url;
  }
  
  // Fallback for Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  // Final fallback (Current machine IP)
  const fallbackUrl = 'http://10.0.0.11:3000';
  console.log('Using Fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

export const API_URL = getApiUrl();
