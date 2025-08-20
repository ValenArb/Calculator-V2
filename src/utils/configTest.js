/**
 * Configuration test utility
 * Run this to test if configuration loading works correctly
 */
import appConfig from '../config/appConfig.js';

export const testConfiguration = async () => {
  console.log('🧪 Testing configuration loading...');
  
  try {
    const config = await appConfig.loadConfig();
    console.log('✅ Configuration loaded successfully:', config);
    
    const backendUrl = await appConfig.getBackendUrl();
    console.log('🔗 Backend URL:', backendUrl);
    
    const apiUrl = await appConfig.getApiUrl();
    console.log('🌐 API URL:', apiUrl);
    
    const appInfo = await appConfig.getAppInfo();
    console.log('📱 App Info:', appInfo);
    
    const isDev = await appConfig.isDevelopment();
    console.log('🚧 Development mode:', isDev);
    
    return { success: true, config };
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return { success: false, error };
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(testConfiguration, 1000);
}