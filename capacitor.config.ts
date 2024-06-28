import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sirimsense.frugal',
  appName: 'XMOS IoT',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    appendUserAgent: "android:application",
    webContentsDebuggingEnabled: true
  },
  ios: {
    appendUserAgent: "ios:application",
    webContentsDebuggingEnabled: true
  }
};

export default config;
